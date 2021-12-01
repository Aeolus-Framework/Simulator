import { Double } from "bson";
import mongoose from "mongoose";

var consumptionSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date
        },
        household: {
            type: String
        },
        consumption: {
            type: Number
        }
    },
    { versionKey: false }
);

export const consumption = mongoose.model("consumption", consumptionSchema);
