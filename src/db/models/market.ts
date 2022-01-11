var mongoose = require("mongoose");

export interface Market {
    name: string;
    demand: number;
    supply: number;
    bastPrice: number;
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
        basePrice: {
            type: Number,
            required: true
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
