import { Double } from "bson";
import mongoose from "mongoose";

var windspeedSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date
        },
        windspeed: {
            type: Number
        }
    },
    { versionKey: false }
);

export const windspeed = mongoose.model("windspeed", windspeedSchema);
