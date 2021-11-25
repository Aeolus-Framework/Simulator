import { Double } from "bson";

var mongoose = require('mongoose')

var Schema = mongoose.Schema

var consumption = new Schema({
    timestamp: Date,
    consumption: Double
});

var consumptionModel = mongoose.model('ConsumptionModel', consumption)