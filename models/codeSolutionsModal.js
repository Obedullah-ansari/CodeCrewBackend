const mongoose = require("mongoose");

const codeSolutionsSchema = new mongoose.Schema({
  projectname: {
    type: String,
    required: true,
  },
  problemid: {
    type: String,
    required: true,
  },
  tasks_solution: [
    {
      taskId: {
        type: String,
        required: true,
      },
      demoimage : {type : String, default :"default.jpg"},
      code: [
        {
          codetype: { type: String, enum: ["html", "css", "js"] },
           code: { type: String, default: "" },
        },
      ],
    },
  ],
});

const codeSolution = mongoose.model("codeSolution", codeSolutionsSchema);

module.exports = codeSolution;
