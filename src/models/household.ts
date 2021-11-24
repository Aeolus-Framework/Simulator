import { distribution } from "../math/stastistics/distribution";
import { TruncatedNormalDistribution } from "../math/stastistics/truncatedNormalDistribution";
import { uniformDistribution } from "../math/stastistics/uniform";
import { EffectSpike, EffectSpikeGenerator } from "./EffectSpike";

export default class Household {
    public readonly owner: string;

    // House properties
    public readonly area: number;
    public readonly location: Location;

    // Consumption properties
    public readonly baseConsumption: number;
    public readonly heatingEfficiency: number;

    // Production properties
    public readonly numberOfWindturbines: number;
    public readonly maximumWindturbineProduction: number;
    public readonly productionCutoutWindspeed: number;

    private consumptionNoiseDist: distribution;
    private consumptionHighSpikeGenerator: EffectSpikeGenerator;
    private consumptionHighSpike: EffectSpike;

    constructor() {
        this.numberOfWindturbines = 2;
        this.maximumWindturbineProduction = 400;
        this.productionCutoutWindspeed = 20;

        this.baseConsumption = 500;
        this.consumptionHighSpikeGenerator = new EffectSpikeGenerator(1100, 3500, 15, 60);
        this.consumptionNoiseDist = new TruncatedNormalDistribution(-100, 200);
    }

    /**
     * Get the electricity consumption in watts for the last second.
     */
    public GetCurrentElectricityConsumption(dateNow: Date): number {
        if (this.consumptionHighSpike === undefined) {
            // No spike is active
            const newSpikeShouldAppear = Math.random() < 0.00005;
            if (newSpikeShouldAppear) {
                this.consumptionHighSpike = this.consumptionHighSpikeGenerator.getNext(dateNow);
            }
        } else if (!this.consumptionHighSpike.isActive(dateNow)) {
            // Spike has ended
            this.consumptionHighSpike = undefined;
        }

        const noise = this.consumptionNoiseDist.next();
        const highSpikeAmplitude =
            this.consumptionHighSpike === undefined ? 0 : this.consumptionHighSpike.amplitude;

        return this.baseConsumption + highSpikeAmplitude + noise;
    }

    /**
     * Get the electricity production in watts for the last second.
     */
    public GetCurrentElectricityProduction(dateNow: Date): number {
        // TODO: implement as time dependent function, f(windspeed)
        const windspeed = new uniformDistribution(6, 13).next();

        if (windspeed <= 0 || windspeed >= this.productionCutoutWindspeed) {
            return 0;
        }

        const productionPerTurbine = this.maximumWindturbineProduction / (1 + Math.exp(-(windspeed - 9.8)));
        return this.numberOfWindturbines * productionPerTurbine;
    }
}
