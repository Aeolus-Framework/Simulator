import { distribution } from "../math/stastistics/distribution";
import { TruncatedNormalDistribution } from "../math/stastistics/truncatedNormalDistribution";

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
    private spikeAmplitudeDist: distribution;
    private spikeDurationMinutesDist: distribution;

    /**
     * Initialize a new instance if the EffectSpikeGenerator class.
     * @param amplitudeLowerLimit Lower limit of spike amplitude. Unit watt
     * @param amplitudeUpperLimit Upper limit of spike amplitude. Unit watt
     * @param lowerDurationLimit Lower limit of spike duration. Unit minute
     * @param upperDurationLimit Upper limit of spike duration. Unit minute
     */
    constructor(
        amplitudeLowerLimit: number,
        amplitudeUpperLimit: number,
        lowerDurationLimit: number,
        upperDurationLimit: number
    ) {
        this.spikeAmplitudeDist = new TruncatedNormalDistribution(amplitudeLowerLimit, amplitudeUpperLimit);
        this.spikeDurationMinutesDist = new TruncatedNormalDistribution(
            lowerDurationLimit,
            upperDurationLimit
        );
    }

    getNext(date: Date): EffectSpike {
        const spikeDurationInMilliseconds = this.spikeDurationMinutesDist.next() * 60 * 1000;
        const spikeEnds = new Date(date.getTime() + spikeDurationInMilliseconds);
        const spikeAmplitude = this.spikeAmplitudeDist.next();
        return new EffectSpike(spikeEnds, spikeAmplitude);
    }
}
