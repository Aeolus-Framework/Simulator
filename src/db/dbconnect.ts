var mongoose = require('mongoose')

const dbName = 'mongodb://127.0.0.1/test'

mongoose.connect(dbName, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})