import { Schema, model } from "mongoose";

interface Transmission {
    timestamp: Date;
    household: string;
    amount: number;
}

var transmissionSchema = new Schema<Transmission>(
    {
        timestamp: Date,
        household: String,
        amount: Number
    },
    { versionKey: false }
);

export const transmission = model<Transmission>("transmission", transmissionSchema);
