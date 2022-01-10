var mongoose = require("mongoose");

interface Production {
    timestamp: Date;
    household: string;
    production: number;
}

var productionSchema = new mongoose.Schema(
    {
        timestamp: Date,
        household: String,
        production: Number
    },
    { versionKey: false }
);

export const production = mongoose.model("production", productionSchema);
