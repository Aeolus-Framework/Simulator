import { Schema, model } from "mongoose";

interface Battery {
    timestamp: Date;
    household: string;
    energy: number;
}

var batterySchema = new Schema<Battery>(
    {
        timestamp: Date,
        household: String,
        energy: Number
    },
    { versionKey: false }
);

export const batteryHistory = model<Battery>("batteryHistory", batterySchema);
