import mongoose from "mongoose";

const DB_HOST = process.env.MONGODB_HOST;
const DB_NAME = process.env.MONGODB_DATABASE;
const DB_USERNAME = process.env.MONGODB_USERNAME;
const DB_PASSWORD = process.env.MONGODB_PASSWORD;

const DB_CREDENTIALS =
    DB_USERNAME !== undefined && DB_PASSWORD !== undefined
        ? `${encodeURIComponent(DB_NAME)}:${encodeURIComponent(DB_PASSWORD)}@`
        : "";
const DB_CONNECTION_STRING = `mongodb:${DB_CREDENTIALS}//${DB_HOST}/${DB_NAME}`;

console.log(`DB_CONNECTION_STRING: ${DB_CONNECTION_STRING}`);

mongoose.connect(DB_CONNECTION_STRING, {}, err => {
    if (err) throw err;
    console.log(`Connected to database 'test' at ${DB_HOST}`);
});
