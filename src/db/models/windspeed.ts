import { Double } from "bson";
const mongoose = require('mongoose')


var windspeedSchema = new mongoose.Schema({
    timestamp: {
        type: Date,

    },
    windspeed: {
        type: Double
    }
});

const windspeed = mongoose.model('Consumption', windspeedSchema)

module.exports = windspeed
