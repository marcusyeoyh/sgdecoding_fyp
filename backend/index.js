const { MongoClient } = require("mongodb");

const mongoose = require("mongoose");
const MONGO_URL = `${process.env.DB_CONNECTION_STRING}`;

mongoose.connect(MONGO_URL);

const  db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  console.log("Mongoose Connection Successful (index)!");
});
