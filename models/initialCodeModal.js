const mongoose = require("mongoose");

const initialcodeSchema = new mongoose.Schema({
  userid: { type: String },
  initialusercode: [
    {
      problemid: {
        type: String,
      },
      code: [
        {
          codetype: { type: String, enum: ["html", "css", "js"] },
          code: { type: String, default: "" },
        },
      ],
    },
  ],
});

const initialCode = mongoose.model("initialCode", initialcodeSchema);

module.exports = initialCode;
