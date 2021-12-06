import { Battery } from "./Battery";
import { EffectSpike, EffectSpikeGenerator } from "./EffectSpike";
import gaussian from "gaussian";
import Location from "./location";

export default class Household {
    public readonly id: string;
    public readonly owner: string;

    // House properties
    /** Total indoor area of household. Unit square meters [m²] */
    public readonly area: number;
    public readonly location: Location;

    // Consumption properties
    /** Consumption during low peak hours  */
    public readonly baseConsumption: number;
    public readonly heatingEfficiency: number;

    // Battery
    public readonly battery: Battery;

    // Production properties
    /** Number of active windturbines */
    public readonly numberOfActiveWindturbines: number;

    /** Maximum production of a windturbine. Unit Watt [W] */
    public readonly maximumWindturbineProduction: number;

    /** Cut-out windspeed during production. Unit meter per second [m/s] */
    public readonly productionCutinWindspeed: number;
    public readonly productionCutoutWindspeed: number;

    private consumptionHighSpikeGenerator: EffectSpikeGenerator;
    private consumptionHighSpike: EffectSpike;

    constructor(
        id: string,
        owner: string,
        area: number,
        location: Location,
        baseConsumption: number,
        heatingEfficiency: number,
        battery: Battery,
        activeWindturbines: number,
        maximumWindturbineProduction: number,
        productionCutinWindspeed: number,
        productionCutoutWindspeed: number,
        consumptionSpikeAmplitudeMean: number,
        consumptionSpikeAmplitudeVariance: number,
        consumptionSpikeDurationMean: number,
        consumptionSpikeDurationVariance: number
    ) {
        this.id = id;
        this.owner = owner;
        this.area = area;
        this.location = location;
        this.baseConsumption = baseConsumption;
        this.heatingEfficiency = heatingEfficiency;
        this.battery = battery;
        this.numberOfActiveWindturbines = activeWindturbines;
        this.maximumWindturbineProduction = maximumWindturbineProduction;
        this.productionCutinWindspeed = productionCutinWindspeed;
        this.productionCutoutWindspeed = productionCutoutWindspeed;

        this.consumptionHighSpikeGenerator = new EffectSpikeGenerator(
            consumptionSpikeAmplitudeMean,
            consumptionSpikeAmplitudeVariance,
            consumptionSpikeDurationMean,
            consumptionSpikeDurationVariance
        );
    }

    public GetConsumptionNoise(): number {
        return gaussian(0, 100).ppf(Math.random());
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

        const noise = this.GetConsumptionNoise();
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
