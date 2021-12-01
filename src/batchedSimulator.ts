import Household from "./models/household";
import { WindspeedModel } from "./models/wind";

interface SimulatorBatchSize {
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
}

const SECONDS_IN_DAY = 86400;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

let windmodel = new WindspeedModel();
let households = new Array<Household>();
let secondsInBatch: number;

let lastSimulationEndDate: Date = undefined;

async function runNextBatch(): Promise<void> {
    const windspeed = new Array<number>();
    const consumption = new Array<number[]>();
    const production = new Array<number[]>();
    const price = new Array<number>();

    console.log("Simulating next batch...");

    households.forEach(household => {
        production[household.id] = new Array<Number>();
        consumption[household.id] = new Array<Number>();
    });

    let simTime = lastSimulationEndDate;
    for (let offset = 0; offset < secondsInBatch; offset++) {
        simTime = addSecondsToDate(simTime, 1);

        const windNow = windmodel.getWindSpeedAtHeight(15);
        windspeed.push(windNow);

        households.forEach(household => {
            const productionNow = household.GetCurrentElectricityProduction(windNow);
            const consumptionNow = household.GetCurrentElectricityConsumption(simTime);

            production[0].push(productionNow);
            consumption[0].push(consumptionNow);
        });
    }

    console.log(
        `Status: windspeed=${windspeed.length}, consumption=${consumption.length}, production=${production.length}`
    );

    const millisecondsToNextSimTime = calculateTimeToNextDate(new Date(), simTime);
    setTimeout(runNextBatch, millisecondsToNextSimTime);

    lastSimulationEndDate = simTime;
    console.log(`Next simulation batch will run on ${simTime}`);
}

export function startSimulator(batchSize: SimulatorBatchSize): void {
    secondsInBatch =
        (batchSize.day ?? 0) * SECONDS_IN_DAY +
        (batchSize.hour ?? 0) * SECONDS_IN_HOUR +
        (batchSize.minute ?? 0) * SECONDS_IN_MINUTE +
        (batchSize.second ?? 0);

    lastSimulationEndDate = getLastBatchDateFromDB();
    households = getHouseHoldsFromDB();

    const dateNow = new Date();
    if (lastSimulationEndDate > dateNow) {
        const msWait = calculateTimeToNextDate(lastSimulationEndDate, dateNow);
        setTimeout(runNextBatch, msWait);
    } else {
        runNextBatch();
    }
}

/**
 * Calculate time in milliseconds to next date. The calculated time is negative when `nextDate` occur before `dateNow`.
 * @param dateNow Date to start from.
 * @param nextDate Date to end at.
 * @returns Milliseconds to next date.
 */
function calculateTimeToNextDate(dateNow: Date, nextDate: Date): number {
    return nextDate.getTime() - dateNow.getTime();
}

function getLastBatchDateFromDB(): Date {
    // TODO Replace with: response from DB if collection is non-empty; Otherwise, return current current date with time 00:00:00.
    return new Date(2021, 10, 25);
    //return new Date();
}

function getHouseHoldsFromDB(): Household[] {
    // TODO Replace with response from DB. Current state returns some households to start the simulation
    const households = new Array<Household>();
    for (let i = 0; i < 5; i++) {
        const household = new Household();
        household.id = i.toString();
        households.push(household);
    }
    return households;
}

/**
 * Add a number of seconds to a date.
 * @param date date to offset
 * @param seconds seconds to add
 * @returns Date with `seconds` added.
 */
function addSecondsToDate(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1000);
}
