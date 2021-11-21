import { plot, Plot } from "nodeplotlib";
import { electricityConsumption, electricityConsumption_spikeModel } from "./electricity/consumption";
import { TruncatedNormalDistribution } from "./math/stastistics/truncatedNormalDistribution";

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

/**
 * Calculate the consumed power during one year in kilowatt-hours (kWh).
 * @param consumedPower Consumed power in watts
 */
function calculateYearlyConsumption(consumedPower: number[]): number {
    let yearlyConsumption = 0;
    for (let day = 0; day < 365; day++) {
        const avgPowerThisDay = consumedPower.reduce((pValue, cValue) => pValue + cValue) / 86400;
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
