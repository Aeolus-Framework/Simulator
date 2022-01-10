var mongoose = require("mongoose");

interface Battery {
    timestamp: Date;
    household: string;
    energy: number;
}

var batterySchema = new mongoose.Schema(
    {
        timestamp: Date,
        household: String,
        energy: Number
    },
    { versionKey: false }
);

export const batteryHistory = mongoose.model("batteryHistory", batterySchema);
