import { distribution } from "./distribution";

export class TruncatedNormalDistribution implements distribution {
    public readonly min: number;
    public readonly max: number;
    public readonly skew: number;

    /**
     *
     */
    constructor(min: number, max: number, skew = 1) {
        this.min = min;
        this.max = max;
        this.skew = skew;
    }

    next(): number {
        // source: https://stackoverflow.com/a/49434653
        let u = 0;
        let v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = this.next();
        // resample between 0 and 1 if out of range
        else {
            num = Math.pow(num, this.skew); // Skew
            num *= this.max - this.min; // Stretch to fill range
            num += this.min; // offset to min
        }
        return num;
    }
}
