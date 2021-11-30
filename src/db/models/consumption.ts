import { Double } from "bson";
const mongoose = require('mongoose')


var consumptionSchema = new mongoose.Schema({
    timestamp: {
        type: Date,

    },
    household: {
        type: String,
    },
    consumption: {
        type: Double
    }
});

const consumption = mongoose.model('Consumption', consumptionSchema)

module.exports = consumption
