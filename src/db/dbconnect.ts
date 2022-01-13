var mongoose = require("mongoose");

const DB_HOST = process.env.MONGODB_HOST;
const DB_NAME = process.env.MONGODB_DATABASE;
const DB_USERNAME = process.env.MONGODB_USERNAME;
const DB_PASSWORD = process.env.MONGODB_PASSWORD;

const DB_CREDENTIALS = DB_USERNAME !== undefined && DB_PASSWORD !== undefined;
const DB_CONNECTION_STRING = `mongodb://${DB_HOST}/${DB_NAME}`;

const options: any = {};
if (DB_CREDENTIALS) {
    options.authSource = "admin";
    options.user = DB_USERNAME;
    options.pass = DB_PASSWORD;
}

mongoose.connect(DB_CONNECTION_STRING, options, err => {
    console.log(`DB_CONNECTION_STRING: ${DB_CONNECTION_STRING}`);

    if (err) throw err;
    console.log(`Connected to database 'test' at ${DB_HOST}`);
});
