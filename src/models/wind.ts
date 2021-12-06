import { distribution } from "../math/stastistics/distribution";
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
    private lastWindValue: number;
    private changeDist: distribution;
    private hellmanExponent: number;

    /**
     *
     * @param initialValue Initial windspeed
     * @param changeDistribution Distribution to take change values from
     */
    constructor(initialValue: number, maxWindspeedChange: number, hellmanEponent: number) {
        this.changeDist = new TruncatedNormalDistribution(0, maxWindspeedChange);
        this.lastWindValue = initialValue;
        this.hellmanExponent = hellmanEponent;
    }

    /**
     * Get next windspeed at a specified height above the ground.
     * @param height The height to measure the windspeed. If `height < 10` the windspeed is measured at 10 meters above ground.
     * @returns Next windspeed at a specified height above the ground.
     *
     * @see https://en.wikipedia.org/wiki/Wind_gradient#Wind_turbines
     */
    getWindSpeedAtHeight(height: number): number {
        const groundWindspeed = this.getWindspeedGround();
        if (height < 10) return groundWindspeed;

        return groundWindspeed * Math.pow(height / 10, this.hellmanExponent);
    }

    private getWindspeedGround(): number {
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
