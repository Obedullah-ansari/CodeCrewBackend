const mongoose = require("mongoose");

const problemStatementSchema = new mongoose.Schema({
  problemid: { type: mongoose.Schema.Types.ObjectId, ref: "projectsInfo" },
  projectname :{type :String , default :""},
  credits: { type: Number },
  problemtags: { type: [String], default: ["html", "css", "js"] },
  problemdifficulty: { type: String, enum: ["easy", "medium", "hard"] },
  problemmainstatement: { type: String },
  problemsubstatement: { type: String },
  problemimage: { type: String },
  multipletask: [
    {
      task: String,
      completed: String,
    },
  ],
  overallperformace: { type: Number, default: 0 },
});


const problemStatement = mongoose.model(
  "problemStatement",
  problemStatementSchema
);

module.exports = problemStatement;
