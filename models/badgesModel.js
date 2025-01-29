const mongoose = require("mongoose");

const badgesSchema = new mongoose.Schema({
    name: String,
    credits:String,
    badges: {type : String, default :"default.jpg"}
});

const badgesData = mongoose.model(
  "badgesData",
  badgesSchema
);

module.exports = badgesData;
