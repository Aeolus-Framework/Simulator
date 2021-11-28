import Household from "./models/household";
import { WindspeedModel } from "./models/wind";

let windmodel: WindspeedModel;
let households: Household[];
let simulatorInterval: NodeJS.Timer;

export function startSimulator(): void {
    initSimulator();
    simulatorInterval = setInterval(runNextSimCycle, 1000);
}

function initSimulator(): void {
    windmodel = new WindspeedModel();
    households = new Array<Household>();

    for (let i = 0; i < 5; i++) {
        const household = new Household();
        household.id = i.toString();

        households.push(household);
        production[household.id] = new Array<Number>();
        consumption[household.id] = new Array<Number>();
    }
}

let counter = 0;

// Data buffer before inserting into DB
let time = new Array<Date>();
let windspeed = new Array<Number>();
let production = new Array<Number[]>();
let consumption = new Array<Number[]>();
function runNextSimCycle() {
    const timeNow = new Date();
    const windNow = windmodel.getWindSpeedAtHeight(15);

    time.push(timeNow);
    windspeed.push(windNow);
    households.forEach(household => {
        production[household.id].push(household.GetCurrentElectricityProduction(windNow));
        consumption[household.id].push(household.GetCurrentElectricityConsumption(timeNow));
    });

    // Insert into DB and remove from buffer on success.

    // Remove this block to never stop simulation
    counter++;
    if (counter > 60) {
        clearInterval(simulatorInterval);
    }
}
