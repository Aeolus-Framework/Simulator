export default class Household {
    public readonly owner: string;

    // House properties
    public readonly area: number;
    public readonly location: Location;

    // Consumption properties
    public readonly baseConsumption: number;
    public readonly heatingEfficiency: number;

    // Production properties
    public readonly maximumProduction: number;

    /**
     *
     */
    constructor() {
        this.baseConsumption = 0.003;
    }

    /**
     * Get the electricity consumption in watts for the last second.
     */
    public GetCurrentElectricityConsumption(): number {
        throw new Error("Not implemented");
    }

    /**
     * Get the electricity production in watts for the last second.
     */
    public GetCurrentElectricityProduction(): number {
        throw new Error("Not implemented");
    }
}
