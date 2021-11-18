import { electricityProduction } from "../../src/electricity/production";

describe("Electricity Production", () => {
    it("No production above cutout", () => {
        const actual = electricityProduction(25, { cutOutWindspeed: 25, maxPowerProduction: 1.75e6 });
        expect(actual).toBe(0);
    });

    it("No production when wind equal 0 m/s", () => {
        const actual = electricityProduction(0, { cutOutWindspeed: 25, maxPowerProduction: 1.75e6 });
        expect(actual).toBe(0);
    });
});
