var mongoose = require("mongoose");

export interface Market {
    name: string;
    demand: number;
    supply: number;
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
        demand: {
            type: Number,
            min: 0
        },
        supply: {
            type: Number,
            min: 0
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
