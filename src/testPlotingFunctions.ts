import { Layout, plot, Plot } from "nodeplotlib";
import { electricityConsumption, electricityConsumption_spikeModel } from "./electricity/consumption";
import { mean } from "./math/numberArrays";
import { probabilityDensityFunction } from "./math/stastistics/guassian";
import { TruncatedNormalDistribution } from "./math/stastistics/truncatedNormalDistribution";
import { Battery } from "./models/Battery";
import Household from "./models/household";
import { WindspeedModel } from "./models/wind";

export function plotEnergyConsumption_spikeModel() {
    const consumption = new Array<number>();
    const time = new Array<Date>();

    for (let i = 0; i < 60 * 60 * 24; i++) {
        var date = new Date(new Date(2000, 0, 1, 0, 0, 0).getTime() + i * 1000);
        time.push(date);
        consumption.push(electricityConsumption_spikeModel(date));
    }

    const data: Plot[] = [{ x: time, y: consumption, type: "scatter" }];
    plot(data);

    const yearlyConsumption = calculateYearlyConsumption(consumption);
    console.log(`Energy used per year is ${Math.round(yearlyConsumption)} kWh (spike model)`);
}

export function plotEnergyConsumption_normalDistModel() {
    const consumption = new Array<number>();
    const time = new Array<Date>();

    for (let i = 0; i < 60 * 60 * 24; i++) {
        var date = new Date(new Date(2000, 0, 1, 0, 0, 0).getTime() + i * 1000);
        time.push(date);
        consumption.push(electricityConsumption());
    }

    const data: Plot[] = [{ x: time, y: consumption, type: "scatter" }];
    plot(data);

    const yearlyConsumption = calculateYearlyConsumption(consumption);
    console.log(`Energy used per year is ${Math.round(yearlyConsumption)} kWh (normal dist. model)`);
}

export function plotEnergyConsumption_oneHousehold() {
    const consumption = new Array<number>();
    const time = new Array<Date>();
    const household = new Household(
        "",
        "",
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
        10
    );

    for (let i = 0; i < 60 * 60 * 24; i++) {
        var date = new Date(new Date(2000, 0, 1, 0, 0, 0).getTime() + i * 1000);
        time.push(date);
        consumption.push(household.GetCurrentElectricityConsumption(date));
    }

    console.log(`Consumption array length is ${consumption.length}`);
    const data: Plot[] = [{ x: time, y: consumption, type: "scatter" }];
    plot(data);

    const yearlyConsumption = calculateYearlyConsumption(consumption);
    console.log(`Energy used per year is ${Math.round(yearlyConsumption)} kWh (household)`);
}

export function plotEnergyProduction_oneHousehold() {
    const household = new Household(
        "",
        "",
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
        10
    );
    const windModel = new WindspeedModel(4.5, 0.002, 0.34);
    const daysToPlot = 365;

    // Run simulation
    const timeRaw = new Array<Date>();
    const productionRaw = new Array<number>();
    const windspeedRaw = new Array<number>();
    for (let i = 0; i < 86400 * daysToPlot; i++) {
        const date = new Date(new Date(2000, 0, 1, 0, 0, 0).getTime() + i * 1000);
        const windspeed = windModel.getWindSpeedAtHeight(15);
        const production = household.GetCurrentElectricityProduction(windspeed);

        timeRaw.push(date);
        windspeedRaw.push(windspeed);
        productionRaw.push(production);
    }
    const targetArrPlotSize = daysToPlot;
    const timeReduced = reduceDateArraySize(timeRaw, targetArrPlotSize);
    const productionReduced = reduceArraySize(productionRaw, targetArrPlotSize);
    const windspeedReduced = reduceArraySize(windspeedRaw, targetArrPlotSize);

    const data: Plot[] = [
        { x: timeReduced, y: productionReduced, type: "scatter", name: "Production" },
        { x: timeReduced, y: windspeedReduced, type: "scatter", name: "Windspeed", yaxis: "y2" }
    ];
    const layout: Layout = {
        title: "Production and windspeed during a year",
        yaxis: { title: "Production [W]" },
        yaxis2: {
            title: "Windspeed [m/s]",
            overlaying: "y",
            side: "right"
        }
    };
    plot(data, layout);

    const yearlyConsumption = calculateYearlyConsumption(productionReduced);
    console.log(`Energy produced during one year is ${Math.round(yearlyConsumption)} kWh (household)`);
}

export function plotGuassian() {
    const y = new Array<number>();
    const x = new Array<number>();

    for (let i = 0; i < 84600; i++) {
        x.push(i);
        y.push(probabilityDensityFunction(4200, 46000, 10600, i) + 0.45);
    }

    const data: Plot[] = [{ x, y, type: "scatter" }];
    plot(data);

    console.log(`Mean probability is ${y.reduce(mean, 0)}`);
}

export function plotWindspeedDuringYear() {
    const windspeed = new Array<number>();
    const time = new Array<Date>();
    const windModel = new WindspeedModel(4.5, 0.002, 0.34);

    console.log("Sampling data");

    for (let i = 0; i < 60 * 60 * 24 * 180; i++) {
        var date = new Date(new Date(2000, 0, 1, 0, 0, 0).getTime() + i * 1000);
        time.push(date);
        windspeed.push(windModel.getWindSpeedAtHeight(49));
    }

    console.log("Reducing datasize");

    // Reduce datasize
    const targetArrPlotSize = Math.ceil(time.length / 86400);
    const timeSample = reduceDateArraySize(time, targetArrPlotSize);
    const windspeedSample = reduceArraySize(windspeed, targetArrPlotSize);

    const data: Plot[] = [{ x: timeSample, y: windspeedSample, type: "scatter" }];
    plot(data, { title: "Windspeed during a year" });

    console.log(`Average windspeed today is ${Math.round(windspeed.reduce(mean, 0))} m/s`);
}

/**
 * Create a reduced copy (shallow) of an date array.
 * @param arr Date array to reduce size of
 * @param targetSize Size of new date array
 * @returns A reduced copy (shallow) of an date array.
 */
function reduceDateArraySize(arr: Date[], targetSize: number): Date[] {
    const reducedBlockSize = arr.length / targetSize;
    const arrReduced = new Array<Date>();
    for (let i = 0; i < targetSize; i++) {
        arrReduced.push(arr.slice(i * reducedBlockSize, i * reducedBlockSize + reducedBlockSize)[0]);
    }
    return arrReduced;
}

/**
 * Create a reduced copy (shallow) of an array.
 * @param arr Array to reduce size of
 * @param targetSize Size of new array
 * @returns A reduced copy (shallow) of an array.
 */
function reduceArraySize(arr: number[], targetSize: number): number[] {
    const reducedBlockSize = arr.length / targetSize;
    const arrReduced = new Array<number>();
    for (let i = 0; i < targetSize; i++) {
        arrReduced.push(
            arr.slice(i * reducedBlockSize, i * reducedBlockSize + reducedBlockSize).reduce(mean, 0)
        );
    }
    return arrReduced;
}

/**
 * Calculate the consumed power during one year in kilowatt-hours (kWh).
 * @param consumedPower Consumed power in watts
 */
export function calculateYearlyConsumption(consumedPower: number[]): number {
    let yearlyConsumption = 0;
    for (let day = 0; day < 365; day++) {
        const avgPowerThisDay = consumedPower.reduce(mean, 0);
        yearlyConsumption += avgPowerThisDay * 24;
    }
    return yearlyConsumption / 1000; // Convert from W to kW.
}

export function plotTruncatedNormalDist() {
    const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const dist = new TruncatedNormalDistribution(0, 10, 0.25);
    for (let i = 0; i < 100000000; i++) {
        const next = Math.round(dist.next());
        y[next] += 1;
    }

    const data: Plot[] = [{ x: x, y: y, type: "bar" }];
    plot(data);
}
