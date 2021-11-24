import { TruncatedNormalDistribution } from "../math/stastistics/truncatedNormalDistribution";

/**
 * A model to simulate windspeed.
 *
 * The model is based on small changes in windspeed each second. This model is to be used when sampling the windspeed with 1 Hz. If it is used with greater or smaller frequencies, unexpected windspeeds may occur.
 *
 * Probability of change when last windspeed was:
 * - `< 2 m/s`, Increase: 0.6, Decrease, 0.4
 * - `> 8 m/s`, Increase: 0.4, Decrease, 0.6
 * - Else, Increase: 0.5, Decrease: 0.5
 *
 * Each change is truncated normal distributed with min and max as 0 and 0.002, respectively.
 *
 * @see TruncatedNormalDistribution truncated normal distributed value generator
 */
export class WindspeedModel {
    private lastWindValue = 4.5;

    // Windspeed change parameters
    private changeDist = new TruncatedNormalDistribution(0, 0.002);

    /**
     *
     * @returns
     */
    getWindspeed(): number {
        const windspeedChange = this.generateWindspeedChange();
        this.lastWindValue += windspeedChange;
        return Math.abs(this.lastWindValue);
    }

    private generateWindspeedChange(): number {
        let probabilityOfIncrease = 0.5;
        if (this.lastWindValue < 2) probabilityOfIncrease = 0.6;
        else if (this.lastWindValue > 8) probabilityOfIncrease = 0.4;

        const randomValue = Math.random();
        const shouldIncreaseChange = randomValue < probabilityOfIncrease;
        if (shouldIncreaseChange) {
            return this.changeDist.next();
        }
        return -1 * this.changeDist.next();
    }
}
