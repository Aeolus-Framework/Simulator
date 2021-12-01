import { Double } from "bson";
const mongoose = require('mongoose')


var productionSchema = new mongoose.Schema({
    timestamp: {
        type: Date,

    },
    household: {
        type: String,
    },
    production: {
        type: Double
    }
});

const production = mongoose.model('Consumption', productionSchema)

module.exports = production
