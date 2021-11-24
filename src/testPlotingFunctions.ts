import { plot, Plot } from "nodeplotlib";
import { electricityConsumption, electricityConsumption_spikeModel } from "./electricity/consumption";
import { mean } from "./math/numberArrays";
import { TruncatedNormalDistribution } from "./math/stastistics/truncatedNormalDistribution";
import Household from "./models/household";

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
    const household = new Household();

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
    const household = new Household();

    // Run simulation
    const timeRaw = new Array<Date>();
    const productionRaw = new Array<number>();
    for (let i = 0; i < 60 * 60 * 24; i++) {
        const date = new Date(new Date(2000, 0, 1, 0, 0, 0).getTime() + i * 1000);
        timeRaw.push(date);
        productionRaw.push(household.GetCurrentElectricityProduction(date));
    }

    // Reduce raw data into 10 minutes intervals
    const timeReduced = new Array<Date>();
    const productionReduced = new Array<number>();
    for (let i = 0; i < 144; i++) {
        const timeBatch = timeRaw.splice(0, 600);
        const prodBatch = productionRaw.splice(0, 600);
        timeReduced.push(timeBatch[0]);
        productionReduced.push(prodBatch.reduce(mean, 0));
        //productionReduced.push(prodBatch.reduce(sum) / 600);
    }

    const data: Plot[] = [{ x: timeReduced, y: productionReduced, type: "scatter" }];
    plot(data);

    const yearlyConsumption = calculateYearlyConsumption(productionReduced);
    console.log(`Energy produced during one year is ${Math.round(yearlyConsumption)} kWh (household)`);
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
