import { TruncatedNormalDistribution } from "../math/stastistics/truncatedNormalDistribution";

const nDist = new TruncatedNormalDistribution(0.005, 0.01, 1);

/**
 * Get a the electricity consumption in watt for the last second.
 * @returns The electricity consumption in watt for the last second.
 */
export function electricityConsumption(): number {
    return nDist.next();
}