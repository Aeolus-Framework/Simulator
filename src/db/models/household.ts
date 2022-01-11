var mongoose = require("mongoose");

export interface Household {
    owner: string;
    thumbnail?: string;
    area: number;
    location: {
        latitude: number;
        longitude: number;
    };
    blackout: boolean;
    baseConsumption: number;
    heatingEfficiency: number;
    battery: {
        maxCapacity: number;
    };
    sellRatioOverProduction: number;
    buyRatioUnderProduction: number;
    windTurbines: {
        active: number;
        maximumProduction: number;
        cutinWindspeed: number;
        cutoutWindspeed: number;
    };
    consumptionSpike: {
        AmplitudeMean: number;
        AmplitudeVariance: number;
        DurationMean: number;
        DurationVariance: number;
    };
}

var householdSchema = new mongoose.Schema(
    {
        owner: { type: String, required: true },
        thumbnail: String,
        name: { type: String, required: true },
        area: { type: Number, required: true, min: 0 },
        location: {
            latitude: { type: Number, required: true, min: -90, max: 90 },
            longitude: { type: Number, required: true, min: -180, max: 180 }
        },
        blackout: { type: Boolean, required: false, default: false },
        baseConsumption: { type: Number, required: true, min: 0 },
        heatingEfficiency: { type: Number, required: false, min: 0, default: 0 },
        battery: {
            maxCapacity: { type: Number, required: true, min: 0 }
        },
        sellRatioOverProduction: { type: Number, required: true, min: 0, max: 1 },
        buyRatioUnderProduction: { type: Number, required: true, min: 0, max: 1 },
        windTurbines: {
            active: { type: Number, required: true, min: 0 },
            maximumProduction: { type: Number, required: true, min: 0 },
            cutinWindspeed: {
                type: Number,
                required: true,
                min: 0,
                validate: [validatorCutinWindspeed, "Cutin windspeed must be less than cutout windspeed"]
            },
            cutoutWindspeed: {
                type: Number,
                required: true,
                min: 0,
                validate: [validatorCutoutWindspeed, "Cutout windspeed must be greater than cutin windspeed"]
            }
        },
        consumptionSpike: {
            AmplitudeMean: { type: Number, required: true },
            AmplitudeVariance: { type: Number, required: true },
            DurationMean: { type: Number, required: true },
            DurationVariance: { type: Number, required: true }
        }
    },
    { versionKey: false }
);

export const household = mongoose.model("household", householdSchema);

function validatorCutinWindspeed(value: number): boolean {
    return this.windTurbines.cutoutWindspeed > value;
}

function validatorCutoutWindspeed(value: number): boolean {
    return this.windTurbines.cutinWindspeed < value;
}

/**
 * Check wether a household exist
 * @param id Id of household
 */
export async function householdExist(id: string): Promise<boolean> {
    return await household.exist({ _id: id });
}
