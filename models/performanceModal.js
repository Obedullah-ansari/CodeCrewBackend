const mongoose = require("mongoose");

const userPerformanceSchema = new mongoose.Schema({
  userid: String,
  username: String,
  useremail: String,
  userimage: { type: String, default: "default.jpg" },
  Progress: [
    {
      languagename: String,
      languageprogress: Number,
    },
  ],
  credits: { type: Number, default: 0 },
  badges: [String],
  totalprojectdone: { type: Number, default: 0 },
  currentlyworking: String,
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  nextbadgecredit: { type: Number, default: 0 },
  multipletask: [
    {
      problemid: { type: String },
      iscompleted: { type: Boolean, default: false },
      task: [
        {
          taskId: String,
          complete: { type: String, default: "pending" },
          performance: { type: Number, default: 0 },
        },
      ],
    },
  ],
});

const userPerformance = mongoose.model(
  "userPerformance",
  userPerformanceSchema
);

module.exports = userPerformance;
