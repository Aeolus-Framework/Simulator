var mongoose = require("mongoose");

export interface PowerPlant {
    name: string;
    energySource: string;
    active: boolean;
}

var powerplantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        energySource: {
            type: String,
            default: "Coal"
        },
        active: {
            type: Boolean,
            required: true
        }
    },
    { versionKey: false }
);

export const powerplant = mongoose.model("powerplant", powerplantSchema);
