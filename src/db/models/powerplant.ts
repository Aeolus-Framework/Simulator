var mongoose = require("mongoose");

export interface PowerPlant {
    name: string;
    energySource: string;
    active: boolean;
    production: {
        updatedAt: Date;
        value: Number;
    };
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
        },
        production: {
            updatedAt: {
                type: Date,
                required: true
            },
            value: {
                type: Number,
                required: true,
                min: 0
            }
        }
    },
    { versionKey: false }
);

export const powerplant = mongoose.model("powerplant", powerplantSchema);
