import Household from "./models/household";
import { WindspeedModel } from "./models/wind";

import { getLatestWindspeed, windspeed as WindspeedDocument } from "./db/models/windspeed";
import { production as ProductionDocument } from "./db/models/production";
import { consumption as ConsumptionDocument } from "./db/models/consumption";
import { Household as HouseholdInterface, household as HouseholdDocument } from "./db/models/household";
import { batteryHistory as BatteryDocument } from "./db/models/battery";
import { transmission as TransmissionDocument } from "./db/models/transmission";
import { market as MarketCollection } from "./db/models/market";
import { powerplant as PowerplantCollection } from "./db/models/powerplant";

export interface SimulatorParameters {
    windspeed: {
        maxWindspeedChange: number;
        hellmanExponent: number;
        initialWindspeed: number;
    };
    market: {
        demandEffect: number;
        name: string;
    };
    powerplantName: string;
}

export class Simulator {
    private windmodel: WindspeedModel;
    private windmodelParameters: {
        maxwindspeedChange: number;
        hellmanExponent: number;
        initialWindspeed: number;
    };
    private households: Household[];

    /**
     * The effect the market demand will have on the final price.
     */
    private marketDemandEffect: number;

    /**
     * Name of market to use when buying and selling electricity.
     */
    private marketName: string;

    /**
     * Name of powerplant to generate electricity in case of prosumer underproduction.
     */
    private powerplantName: string;

    // TODO #15 Add parameter to set at which rate simulationdata is saved to DB
    constructor(options: SimulatorParameters) {
        this.windmodelParameters = {
            initialWindspeed: options.windspeed.initialWindspeed,
            maxwindspeedChange: options.windspeed.maxWindspeedChange,
            hellmanExponent: options.windspeed.hellmanExponent
        };
        this.households = [];
        this.marketDemandEffect = options.market.demandEffect;
        this.marketName = options.market.name;
        this.powerplantName = options.powerplantName;
    }

    async start() {
        const households = await this.getHouseholdsInDB();

        this.households = households;
        this.windmodel = new WindspeedModel(
            this.windmodelParameters.initialWindspeed,
            this.windmodelParameters.maxwindspeedChange,
            this.windmodelParameters.hellmanExponent
        );

        this.runNextSimCycle();
    }

    private async runNextSimCycle(): Promise<void> {
        const timeNow = new Date(new Date().setMilliseconds(0));
        const windNow = this.windmodel.getWindSpeedAtHeight(15);
        const [market, powerplant] = await Promise.all([
            MarketCollection.findOne({ name: this.marketName }),
            PowerplantCollection.findOne({ name: this.powerplantName })
        ]);

        if (market === null) {
            throw new Error(`The requested market with name "${this.marketName}" was not found`);
        }
        if (powerplant === null) {
            throw new Error(`The requested powerplant with name "${this.powerplantName}" was not found`);
        }

        /** Marketdemand in kilowatthours (kWh) */
        let marketDemand = 0;
        /** Marketsupply in kilowatthours (kWh) */
        let marketSupply = 0;

        this.households.forEach(household => {
            const productionNow = household.GetCurrentElectricityProduction(windNow);
            const consumptionNow = household.blackout
                ? 0
                : household.GetCurrentElectricityConsumption(timeNow);
            const productionOverflow = productionNow - consumptionNow;
            let energyMarketTransmission = 0;
            let blackout = false;

            if (productionOverflow > 0) {
                // Sell to market
                let energyToAddToBattery: number;

                if (household.sellLimit?.start <= timeNow && timeNow <= household.sellLimit?.end) {
                    energyToAddToBattery = productionOverflow;
                    energyMarketTransmission = 0;
                } else {
                    energyToAddToBattery = productionOverflow * (1 - household.sellRatioOverProduction);
                    energyMarketTransmission = productionOverflow * household.sellRatioOverProduction;
                    marketSupply += energyMarketTransmission * 1e-3;
                }

                household.battery.charge(energyToAddToBattery, 1);
            } else if (productionOverflow < 0) {
                // Buy from market
                energyMarketTransmission = productionOverflow * household.buyRatioUnderProduction;

                marketDemand += Math.abs(energyMarketTransmission * 1e-3);

                const energyToTakeFromBattery =
                    Math.abs(productionOverflow) * (1 - household.buyRatioUnderProduction);
                const energyTakenFromBattery = household.battery.useBattery(energyToTakeFromBattery, 1);

                if (!powerplant.active) {
                    const energyShortage = energyToTakeFromBattery - energyTakenFromBattery < 0;
                    if (energyShortage) blackout = true;
                }
            }

            this.saveHouseholdSimulationCycleToDB({
                time: timeNow,
                blackout: blackout,
                householdId: household.id,
                production: productionNow,
                consumption: consumptionNow,
                batteryEnergy: household.battery.getCurrentEnergy(),
                energyMarketTransmission: energyMarketTransmission
            });
        });

        if (market.price.validUntil <= timeNow) {
            market.price.updatedAt = timeNow;
            market.price.validUntil = new Date(timeNow.getTime() + 1000);
            market.price.value = this.calculatePrice(market.basePrice, marketSupply, marketDemand);
        }
        market.demand = marketDemand;
        market.supply = marketSupply;

        powerplant.production.updatedAt = timeNow;
        if (powerplant.active) {
            powerplant.production.value = marketDemand < marketSupply ? 0 : marketDemand - marketSupply;
        } else {
            powerplant.production.value = 0;
        }

        this.saveOuterSimulationCycleToDb(timeNow, windNow, market, powerplant);

        console.log(`Simulation cycle ${timeNow.toISOString()} finished`);
        setTimeout(this.runNextSimCycle.bind(this), this.millisecondsToNextSecond());
    }

    private async getHouseholdsInDB(): Promise<Household[]> {
        let householdsInDB = await HouseholdDocument.find();

        let householdsToReturn = new Array<Household>();
        for (const household of householdsInDB) {
            householdsToReturn.push(
                new Household(household._id.toString(), ConstructHouseholdInterface(household))
            );
        }

        return householdsToReturn;
    }

    async reloadHouseholdToSimulator(householdId: string): Promise<void> {
        const currentHousehold = this.households.find(household => household.id === householdId);
        const householdFromDb = await HouseholdDocument.findOne({ _id: householdId });

        if (householdFromDb === null) {
            const indexOfHousehold = this.households.findIndex(h => h.id === householdId);
            if (indexOfHousehold === -1) return;

            this.households.splice(indexOfHousehold, 1);
            console.log(`Household ${householdId} has been removed from the simulation`);
            return;
        }

        const householdData = ConstructHouseholdInterface(householdFromDb);

        if (currentHousehold === undefined) {
            this.households.push(new Household(householdFromDb._id.toString(), householdData));
        } else {
            currentHousehold.SetParameters(householdData);
        }
        console.log(`Household ${householdId} has been reloaded to the simulation`);
    }

    /**
     * Calculate the price based on market supply and demand
     * @param basePrice The base price for market as sek/kWh
     * @param demand Demand in kilowatthours (kWh)
     * @param supply Supply in kilowatthours (kWh)
     * @returns price per kilowatthour (kWh) in sek.
     */
    private calculatePrice(basePrice: number, supply: number, demand: number): number {
        if (supply == 0) return basePrice * 2 * this.marketDemandEffect;

        return basePrice * (demand / supply) * this.marketDemandEffect;
    }

    private millisecondsToNextSecond(): number {
        const timeNow = new Date();
        return 1000 - timeNow.getMilliseconds();
    }

    private saveHouseholdSimulationCycleToDB(data: {
        time: Date;
        blackout: boolean;
        householdId: string;
        production: number;
        consumption: number;
        batteryEnergy: number;
        energyMarketTransmission: number;
    }): void {
        HouseholdDocument.findByIdAndUpdate(data.householdId, { blackout: data.blackout }).exec();

        new ProductionDocument({
            timestamp: data.time,
            household: data.householdId,
            production: data.production
        }).save();

        new ConsumptionDocument({
            timestamp: data.time,
            household: data.householdId,
            consumption: data.consumption
        }).save();

        new BatteryDocument({
            timestamp: data.time,
            household: data.householdId,
            energy: data.batteryEnergy
        }).save();

        if (data.energyMarketTransmission != 0) {
            new TransmissionDocument({
                timestamp: data.time,
                household: data.householdId,
                amount: data.energyMarketTransmission
            }).save();
        }
    }

    private saveOuterSimulationCycleToDb(time: Date, windspeed: number, market: any, powerplant: any): void {
        market.save();
        powerplant.save();

        new WindspeedDocument({
            timestamp: time,
            windspeed: windspeed
        }).save();
    }
}

function ConstructHouseholdInterface(object: any): HouseholdInterface {
    return {
        owner: object.owner,
        name: object.name,
        area: object.area,
        location: {
            latitude: object.location.latitude,
            longitude: object.location.longitude
        },
        blackout: object.blackout,
        baseConsumption: object.baseConsumption,
        heatingEfficiency: object.heatingEfficiency,
        battery: {
            maxCapacity: object.battery.maxCapacity
        },
        sellRatioOverProduction: object.sellRatioOverProduction,
        buyRatioUnderProduction: object.buyRatioUnderProduction,
        sellLimit: {
            start: object.sellLimit?.start,
            end: object.sellLimit?.end
        },
        windTurbines: {
            active: object.windTurbines.active,
            maximumProduction: object.windTurbines.maximumProduction,
            cutinWindspeed: object.windTurbines.cutinWindspeed,
            cutoutWindspeed: object.windTurbines.cutoutWindspeed
        },
        consumptionSpike: {
            AmplitudeMean: object.consumptionSpike.AmplitudeMean,
            AmplitudeVariance: object.consumptionSpike.AmplitudeVariance,
            DurationMean: object.consumptionSpike.DurationMean,
            DurationVariance: object.consumptionSpike.DurationVariance
        }
    };
}
