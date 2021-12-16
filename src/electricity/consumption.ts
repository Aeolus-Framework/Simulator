import { TruncatedNormalDistribution } from "../math/stastistics/truncatedNormalDistribution";

const nDist = new TruncatedNormalDistribution(400, 800, 1);

/**
 * Get a the electricity consumption in watt for the last second.
 * @returns The electricity consumption in watt for the last second.
 */
export function electricityConsumption(): number {
    return nDist.next();
}

const noiseDist = new TruncatedNormalDistribution(-100, 200);
const spikeAmplitudeDist = new TruncatedNormalDistribution(1100, 3500);
const spikeDurationMinutesDist = new TruncatedNormalDistribution(15, 60);

let spikeEnds = new Date();
let spikeAmplitude = 0;

export function electricityConsumption_spikeModel(dateNow: Date): number {
    const baseConsumption = 500;
    const noise = noiseDist.next();

    if (spikeAmplitude == 0) {
        // No spike is active
        const newSpikeShouldAppear = Math.random() < 0.00005;
        if (newSpikeShouldAppear) {
            const spikeDurationInMilliseconds = spikeDurationMinutesDist.next() * 60 * 1000;
            spikeEnds = new Date(dateNow.getTime() + spikeDurationInMilliseconds);
            spikeAmplitude = spikeAmplitudeDist.next();
        }
    } else if (spikeEnds.getTime() < dateNow.getTime()) {
        // Spike has ended
        spikeAmplitude = 0;
    }

    return baseConsumption + spikeAmplitude + noise;
}
