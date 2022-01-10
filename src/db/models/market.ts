var mongoose = require("mongoose");

export interface Market {
    name: string;
    price: {
        validUntil: Date;
        updatedAt: Date;
        value: number;
        currency: string;
    };
}

var marketSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            index: true
        },
        price: {
            validUntil: Date,
            updatedAt: Date,
            value: Number,
            currency: String
        }
    },
    { versionKey: false }
);

export const market = mongoose.model("market", marketSchema);
