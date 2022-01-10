var mongoose = require("mongoose");

interface Windspeed {
    timestamp: Date;
    windspeed: number;
}

var windspeedSchema = new mongoose.Schema(
    {
        timestamp: Date,
        windspeed: Number
    },
    { versionKey: false }
);

export const windspeed = mongoose.model("windspeed", windspeedSchema);
