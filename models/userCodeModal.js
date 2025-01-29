const mongoose = require("mongoose");

const userCodeSchema = new mongoose.Schema({
  userid: { type: String },
  projectProgress: [
    {
      projectname: { type: String },
      problemtags: { type: [String], default: ["html", "css", "js"] },
      problemid: { type: String },
      problemdifficulty: { type: String },
      tasks: [
        {
          taskId: {
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
    },
  ],
});

const userCode = mongoose.model("userCode", userCodeSchema);

module.exports = userCode;
