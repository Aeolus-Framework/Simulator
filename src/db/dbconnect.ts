import mongoose from "mongoose";

const dbUri = "mongodb://127.0.0.1/test";

mongoose.connect(dbUri, {}, err => {
    if (err) throw err;
    console.log("Connected to database");
});
