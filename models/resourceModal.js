const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    problemid: { type: String },
    imagearray :[String]
});

const resources = mongoose.model("resources", resourceSchema);

module.exports = resources;
