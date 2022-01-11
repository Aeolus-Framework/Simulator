import { Battery } from "./Battery";
import { EffectSpike, EffectSpikeGenerator } from "./EffectSpike";
import gaussian from "gaussian";
import Location from "./location";
import {type Household as HouseholdInterface } from "../db/models/household";

export default class Household {
    public readonly id: string;
    public owner: string;

    // House properties
    /** Total indoor area of household. Unit square meters [m²] */
    public area: number;
    public readonly location: Location;

    // Consumption properties
    /** Consumption during low peak hours  */
    public baseConsumption: number;
    public heatingEfficiency: number;

    // Battery
    public battery: Battery;
    public sellRatioOverProduction: number;
    public buyRatioUnderProduction: number;

    // Production properties
    /** Number of active windturbines */
    public numberOfActiveWindturbines: number;

    /** Maximum production of a windturbine. Unit Watt [W] */
    public maximumWindturbineProduction: number;

    /** Cut-out windspeed during production. Unit meter per second [m/s] */
    public productionCutinWindspeed: number;
    public productionCutoutWindspeed: number;

    private consumptionHighSpikeGenerator: EffectSpikeGenerator;
    private consumptionHighSpike: EffectSpike;

    constructor(id: string, data: HouseholdInterface) {
        this.id = id;
        this.location = new Location(data.location.latitude, data.location.longitude);
        this.battery = new Battery(0, data.battery.maxCapacity);
        this.SetParameters(data);
    }

    public SetParameters(data: HouseholdInterface) {
        this.owner = data.owner;
        this.area = data.area;
        this.location.latitude = data.location.latitude;
        this.location.longitude = data.location.longitude;
        this.baseConsumption = data.baseConsumption;
        this.heatingEfficiency = data.heatingEfficiency;
        this.battery.maxEnergy = data.battery.maxCapacity;
        this.numberOfActiveWindturbines = data.windTurbines.active;
        this.maximumWindturbineProduction = data.windTurbines.maximumProduction;
        this.productionCutinWindspeed = data.windTurbines.cutinWindspeed;
        this.productionCutoutWindspeed = data.windTurbines.cutoutWindspeed;

        if (!this.consumptionHighSpikeGenerator) {
            this.consumptionHighSpikeGenerator = new EffectSpikeGenerator(
                data.consumptionSpike.AmplitudeMean,
                data.consumptionSpike.AmplitudeVariance,
                data.consumptionSpike.DurationMean,
                data.consumptionSpike.DurationVariance
            );
        } else {
            this.consumptionHighSpikeGenerator.amplitudeMean = data.consumptionSpike.AmplitudeMean;
            this.consumptionHighSpikeGenerator.amplitudeVariance = data.consumptionSpike.AmplitudeVariance;
            this.consumptionHighSpikeGenerator.durationMean = data.consumptionSpike.DurationMean;
            this.consumptionHighSpikeGenerator.durationVariance = data.consumptionSpike.DurationVariance;
        }

        this.sellRatioOverProduction = data.sellRatioOverProduction;
        this.buyRatioUnderProduction = data.buyRatioUnderProduction;
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
