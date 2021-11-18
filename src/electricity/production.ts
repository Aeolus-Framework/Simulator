interface WindturbineParameters {
    /**
     * Maximum power production of the windturbine, measured in watts (W)
     */
    maxPowerProduction: number;

    //public cutInWindspeed: number;

    /**
     * Maximum operational windspeed of the windturbine, exceeding this limit
     * will stop the production.
     *
     * Measured in meters per second (m/s).
     */
    cutOutWindspeed: number;
}

/**
 * Calculate the power production from a windturbine based on the windspeed.
 *
 * Cut-in windspeed will always be 3-4 m/s.
 * @param windspeed Windspeed in m/s when generating electricity.
 * @param params General turbine parameters.
 * @returns The current electricity production in mega watt (MW)
 */
export function electricityProduction(windspeed: number, params: WindturbineParameters): number {
    if (windspeed <= 0 || windspeed >= params.cutOutWindspeed) {
        return 0;
    }

    return params.maxPowerProduction / (1 + Math.exp(-(windspeed - 9.8)));
}
