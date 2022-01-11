import Household from "./models/household";
import Location from "./models/location";
import { Battery } from "./models/Battery";
import { WindspeedModel } from "./models/wind";

import { windspeed as WindspeedDocument } from "./db/models/windspeed";
import { production as ProductionDocument } from "./db/models/production";
import { consumption as ConsumptionDocument } from "./db/models/consumption";
import { household as HouseholdDocument } from "./db/models/household";
import { batteryHistory as BatteryDocument } from "./db/models/battery";
import { transmission as TransmissionDocument } from "./db/models/transmission";
import { market, market as MarketCollection } from "./db/models/market";
import { powerplant as PowerplantCollection } from "./db/models/powerplant";

import "./db/dbconnect";

export class Simulator {
    private windmodel: WindspeedModel;
    private households: Household[];

    /**
     * The base price for market as sek/kWh. If `demand == supply`, the value of basePrice will be the current price.
     */
    private basePrice: number;

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

    // TODO Add simulator parameters
    // TODO Add parameter to set at which rate simulationdata is saved to DB
    constructor() {
        this.windmodel = new WindspeedModel(4.5, 0.002, 0.34);
        this.households = [];
        this.basePrice = 0.7;
        this.marketDemandEffect = 1;
        this.marketName = "default";
        this.powerplantName = "default";
    }

    async start() {
        this.households = await this.getHouseholdsInDB();
        this.runNextSimCycle();
    }

    async runNextSimCycle(): Promise<void> {
        console.log("Simulation cycle");
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

        let marketDemand = 0; // unit watthour (Wh)
        let marketSupply = 0; // unit watthour (Wh)
        this.households.forEach(household => {
            const productionNow = household.GetCurrentElectricityProduction(windNow);
            const consumptionNow = household.GetCurrentElectricityConsumption(timeNow);
            const productionOverflow = productionNow - consumptionNow;
            let energyMarketTransmission = 0;
            let blackout = false;

            if (productionOverflow > 0) {
                // Sell to market
                energyMarketTransmission = productionOverflow * household.sellRatioOverProduction;

                marketSupply += energyMarketTransmission * 1e-3;

                const energyToAddToBattery = productionOverflow * (1 - household.sellRatioOverProduction);
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
            market.price.validUntil = new Date(timeNow.getTime() + 1000);
            market.price.value = this.calculatePrice(marketSupply, marketDemand);
        }
        market.demand = marketDemand;
        market.supply = marketSupply;

        this.saveOuterSimulationCycleToDb(timeNow, windNow, market);

        console.log(`Simulation cycle ${timeNow.toISOString()} finished`);
        setTimeout(this.runNextSimCycle.bind(this), this.millisecondsToNextSecond());
    }

    async getHouseholdsInDB(): Promise<Household[]> {
        let householdsInDB = await HouseholdDocument.find();

        let householdsToReturn = new Array<Household>();
        if (householdsInDB.length == 0) {
            for (let i = 0; i < 5; i++) {
                const household = new Household(
                    i.toString(),
                    "9d598d69-c660-4085-b0aa-830106e3a09e",
                    147,
                    undefined,
                    500,
                    0,
                    new Battery(0, 1e6),
                    3,
                    3500,
                    2,
                    20,
                    2300,
                    300,
                    35,
                    10,
                    0.5,
                    0.5
                );

                householdsToReturn.push(household);
            }
        } else {
            for (const household of householdsInDB) {
                householdsToReturn.push(
                    new Household(
                        household._id,
                        household.owner,
                        household.area,
                        new Location(household.location.latitude, household.location.longitude),
                        household.baseConsumption,
                        household.heatingEfficiency,
                        new Battery(0, household.battery.maxCapacity),
                        household.windTurbines.active,
                        household.windTurbines.maximumProduction,
                        household.windTurbines.cutinWindspeed,
                        household.windTurbines.cutoutWindspeed,
                        household.consumptionSpike.AmplitudeMean,
                        household.consumptionSpike.AmplitudeVariance,
                        household.consumptionSpike.DurationMean,
                        household.consumptionSpike.DurationVariance,
                        household.sellRatioOverProduction,
                        household.buyRatioUnderProduction
                    )
                );
            }
        }

        return householdsToReturn;
    }

    /**
     * Calculate the price based on market supply and demand
     * @param demand Demand in kilowatthours (kWh)
     * @param supply Supply in kilowatthours (kWh)
     * @returns price per kilowatthour (kWh) in sek.
     */
    calculatePrice(supply: number, demand: number): number {
        if (supply == 0) return 0;

        return this.basePrice * (demand / supply) * this.marketDemandEffect;
    }

    millisecondsToNextSecond(): number {
        const timeNow = new Date();
        return 1000 - timeNow.getMilliseconds();
    }

    saveHouseholdSimulationCycleToDB(data: {
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

    saveOuterSimulationCycleToDb(time: Date, windspeed: number, market: any): void {
        market.save();

        new WindspeedDocument({
            timestamp: time,
            windspeed: windspeed
        }).save();
    }
}
