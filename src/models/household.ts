import { distribution } from "../math/stastistics/distribution";
import { TruncatedNormalDistribution } from "../math/stastistics/truncatedNormalDistribution";
import { EffectSpike, EffectSpikeGenerator } from "./EffectSpike";

export default class Household {
    public id: string;
    public readonly owner: string;

    // House properties
    /** Total indoor area of household. Unit square meters [m²] */
    public readonly area: number;

    public readonly location: Location;

    // Consumption properties
    /** Consumption during low peak hours  */
    public readonly baseConsumption: number;
    public readonly heatingEfficiency: number;

    // Buffer
    /** Energy in buffer. Unit Joule [J] */
    public energyInBuffer: number; // J

    // Production properties
    /** Number of active windturbines */
    public readonly numberOfActiveWindturbines: number;

    /** Maximum production of a windturbine. Unit Watt [W] */
    public readonly maximumWindturbineProduction: number;

    /** Cut-out windspeed during production. Unit meter per second [m/s] */
    public readonly productionCutoutWindspeed: number;

    private consumptionNoiseDist: distribution;
    private consumptionHighSpikeGenerator: EffectSpikeGenerator;
    private consumptionHighSpike: EffectSpike;

    constructor() {
        this.numberOfActiveWindturbines = 2;
        this.maximumWindturbineProduction = 3500;
        this.productionCutoutWindspeed = 20;

        this.baseConsumption = 500;
        this.consumptionHighSpikeGenerator = new EffectSpikeGenerator(1100, 3500, 15, 60);
        this.consumptionNoiseDist = new TruncatedNormalDistribution(-100, 200);
    }

    /**
     * Add energy to buffer
     * @param energy Energy to add to buffer. Unit Joule [J]
     * @returns Total energy in buffer after more energy was added.
     */
    public AddEnergyToBuffer(energy: number): number {
        this.energyInBuffer += energy;
        return this.energyInBuffer;
    }

    /**
     * Take energy stored in buffer. If more energy is taken than avaliable in
     * the buffer, no energy is taken and an error is thrown.
     * @param energyToTake Energy to take from buffer
     * @returns Energy left in buffer after taking energy from buffer
     */
    public TakeEnergyInBuffer(energyToTake: number): number {
        if (this.energyInBuffer < energyToTake) throw new Error("Exceeded avaliable energy in buffer");

        this.energyInBuffer -= energyToTake;
        return this.energyInBuffer;
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
    public GetCurrentElectricityProduction(windspeed: number): number {
        if (windspeed <= 0 || windspeed >= this.productionCutoutWindspeed) {
            return 0;
        }

        const productionPerTurbine = this.maximumWindturbineProduction / (1 + Math.exp(-(windspeed - 9.8)));
        return this.numberOfActiveWindturbines * productionPerTurbine;
    }
}
