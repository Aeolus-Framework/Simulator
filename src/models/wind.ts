import { probabilityDensityFunction } from "../math/stastistics/guassian";
import { TruncatedNormalDistribution } from "../math/stastistics/truncatedNormalDistribution";

export class WindspeedModel {
    private lastWindValue = 4.5;

    // Windspeed change parameters
    private amplitude = 10000;
    private mean = 43000;
    private standardDeviation = 10600;
    private changeDist = new TruncatedNormalDistribution(0, 0.0001);

    /**
     *
     * @param dateNow The date of which to get the windspeed for.
     */
    getWindspeed(dateNow: Date): number {
        const windspeedChange = this.generateWindspeedChange(dateNow);
        this.lastWindValue += windspeedChange;
        return this.lastWindValue;
    }

    private generateWindspeedChange(dateNow: Date): number {
        const timeofDay = dateNow.getSeconds() + 60 * dateNow.getMinutes() + 60 * 60 * dateNow.getHours();
        const probabilityOfIncrease =
            0.4 + probabilityDensityFunction(this.amplitude, this.mean, this.standardDeviation, timeofDay);
        const randomValue = Math.random();
        const shouldIncreaseChange = randomValue < probabilityOfIncrease;
        if (shouldIncreaseChange) {
            return this.changeDist.next();
        }
        return -1 * this.changeDist.next();
    }
}
