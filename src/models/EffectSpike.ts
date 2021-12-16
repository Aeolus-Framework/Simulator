import gaussian from "gaussian";

export class EffectSpike {
    public endDate: Date;
    public amplitude: number;

    /**
     *
     */
    constructor(endDate: Date, amplitude: number) {
        this.endDate = endDate;
        this.amplitude = amplitude;
    }

    isActive(currentDate: Date): boolean {
        return currentDate < this.endDate;
    }
}

export class EffectSpikeGenerator {
    amplitudeMean: number;
    amplitudeVariance: number;
    durationMean: number;
    durationVariance: number;

    /**
     * Initialize a new instance if the EffectSpikeGenerator class.
     * @param amplitudeMean Mean value of spike amplitude. Unit watt
     * @param amplitudeVariance Variance of spike amplitude. Unit watt
     * @param durationMean Mean value of spike duration. Unit minute
     * @param durationVariance Variance of spike duration. Unit minute
     */
    constructor(
        amplitudeMean: number,
        amplitudeVariance: number,
        durationMean: number,
        durationVariance: number
    ) {
        this.amplitudeMean = amplitudeMean;
        this.amplitudeVariance = amplitudeVariance;
        this.durationMean = durationMean;
        this.durationVariance = durationVariance;
    }

    private getNextAmplitude(): number {
        return gaussian(this.amplitudeMean, this.amplitudeVariance).ppf(Math.random());
    }

    private getNextDuration(): number {
        return gaussian(this.durationMean, this.durationVariance).ppf(Math.random());
    }

    getNext(date: Date): EffectSpike {
        const spikeDurationInMilliseconds = this.getNextDuration() * 60 * 1000;
        const spikeEnds = new Date(date.getTime() + spikeDurationInMilliseconds);
        const spikeAmplitude = this.getNextAmplitude();
        return new EffectSpike(spikeEnds, spikeAmplitude);
    }
}
