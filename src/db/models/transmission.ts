var mongoose = require("mongoose");

interface Transmission {
    timestamp: Date;
    household: string;
    amount: number;
}

var transmissionSchema = new mongoose.Schema(
    {
        timestamp: Date,
        household: String,
        amount: Number
    },
    { versionKey: false }
);

export const transmission = mongoose.model("transmission", transmissionSchema);
