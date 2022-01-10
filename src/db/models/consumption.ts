var mongoose = require("mongoose");

interface Consumption {
    timestamp: Date;
    household: string;
    consumption: number;
}

var consumptionSchema = new mongoose.Schema(
    {
        timestamp: Date,
        household: String,
        consumption: Number
    },
    { versionKey: false }
);

export const consumption = mongoose.model("consumption", consumptionSchema);
