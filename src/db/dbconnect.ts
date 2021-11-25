var mongoose = require('mongoose')

var mongoDB = 'mongodb://127.0.0.1/test'
mongoose.connect(mongoDB, {useNewURLParser : true, useUnifiedTopology: true})

var db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection Error'))