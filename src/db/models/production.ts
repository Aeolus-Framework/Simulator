import { Double } from "bson";
import mongoose from "mongoose";

var productionSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Date
        },
        household: {
            type: String
        },
        production: {
            type: Number
        }
    },
    { versionKey: false }
);

export const production = mongoose.model("production", productionSchema);
