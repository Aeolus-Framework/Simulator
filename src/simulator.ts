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

import "./db/dbconnect";

export class Simulator {
    private windmodel: WindspeedModel;
    private households: Household[];

    // TODO Add simulator parameters
    constructor() {
        this.windmodel = new WindspeedModel(4.5, 0.002, 0.34);
        this.households = [];
    }

    async start() {
        this.households = await this.getHouseholdsInDB();
        this.runNextSimCycle();
    }

    runNextSimCycle(): void {
        console.log("Simulation cycle");
        const timeNow = new Date(new Date().setMilliseconds(0));
        const windNow = this.windmodel.getWindSpeedAtHeight(15);

        new WindspeedDocument({
            timestamp: timeNow,
            windspeed: windNow
        }).save();

        this.households.forEach(household => {
            const productionNow = household.GetCurrentElectricityProduction(windNow);
            const consumptionNow = household.GetCurrentElectricityConsumption(timeNow);
            const productionOverflow = productionNow - consumptionNow;
            let energyMarketTransmission = 0;

            if (productionOverflow > 0) {
                energyMarketTransmission = productionOverflow * household.sellRatioOverProduction;

                const energyToAddToBattery = productionOverflow * (1 - household.sellRatioOverProduction);
                household.battery.charge(energyToAddToBattery, 1);
            } else if (productionOverflow < 0) {
                energyMarketTransmission = productionOverflow * household.buyRatioUnderProduction;

                const energyToTakeFromBattery =
                    Math.abs(productionOverflow) * (1 - household.buyRatioUnderProduction);
                household.battery.useBattery(energyToTakeFromBattery, 1);
                // TODO Handle blackout if not enough power to fulfill consumption.
            }

            new ProductionDocument({
                timestamp: timeNow,
                household: household.id,
                production: productionNow
            }).save();
            new ConsumptionDocument({
                timestamp: timeNow,
                household: household.id,
                consumption: consumptionNow
            }).save();
            new BatteryDocument({
                timestamp: timeNow,
                household: household.id,
                energy: household.battery.getCurrentEnergy()
            }).save();
            if (energyMarketTransmission != 0) {
                new TransmissionDocument({
                    timestamp: timeNow,
                    household: household.id,
                    amount: energyMarketTransmission
                }).save();
            }
        });

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

    millisecondsToNextSecond(): number {
        const timeNow = new Date();
        return 1000 - timeNow.getMilliseconds();
    }
}
