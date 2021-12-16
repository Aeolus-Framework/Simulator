import { distribution } from "./distribution";

export class uniformDistribution implements distribution {
    public min: number;
    public max: number;

    private readonly valueRange: number;

    /**
     * Initialize a new instance of the uniformDistribution class. The random
     * value will be equal or within the min and max limits, i.e., [min, max].
     * @param min Specify lower bound.
     * @param max Specify upper bound.
     */
    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;

        this.valueRange = this.max - this.min;
    }

    next(): number {
        return Math.random() * this.valueRange + this.min;
    }
}
