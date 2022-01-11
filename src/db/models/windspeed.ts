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

/**
 *
 * @returns If collection is non-empty latest windspeed. Otherwise, undefined.
 */
export async function getLatestWindspeed(): Promise<number | undefined> {
    const doc = await windspeed.findOne().sort({ timestamp: -1 }).select("windspeed").exec();
    return doc?.windspeed;
}
