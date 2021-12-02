import Household from "./models/household";
import { WindspeedModel } from "./models/wind";
import { windspeed as WindspeedDocument } from "./db/models/windspeed";
import { production as ProductionDocument } from "./db/models/production";
import { consumption as ConsumptionDocument } from "./db/models/consumption";

import "./db/dbconnect";

let windmodel: WindspeedModel;
let households: Household[];

export function startSimulator(): void {
    initSimulator();
    runNextSimCycle();
}

function initSimulator(): void {
    windmodel = new WindspeedModel();
    households = new Array<Household>();

    for (let i = 0; i < 5; i++) {
        const household = new Household();
        household.id = i.toString();

        households.push(household);
    }
}

function runNextSimCycle() {
    const timeNow = new Date();
    const windNow = windmodel.getWindSpeedAtHeight(15);

    new WindspeedDocument({
        timestamp: timeNow,
        windspeed: windNow
    }).save();

    households.forEach(household => {
        const productionNow = household.GetCurrentElectricityProduction(windNow);
        const consumptionNow = household.GetCurrentElectricityConsumption(timeNow);

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
    });

    console.log(timeNow.toISOString());
    setTimeout(runNextSimCycle, millisecondsToNextSecond());
}

function millisecondsToNextSecond(): number {
    const timeNow = new Date();
    return 1000 - timeNow.getMilliseconds();
}
