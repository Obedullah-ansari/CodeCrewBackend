const mongoose = require("mongoose");

const projectsInfoSchema = new mongoose.Schema({
  projectTitle: {
    type: String,
    required: true,
    unique: true,
  },
  projectdescription: {
    type: String,
    default :""
  },
  projectTags: { type: [String], default: ["html", "css", "js"] },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  credits: { type: Number, min: 0, default: 0 },

  active: {type:String , default:"commingsoon"}
});

const projectsInfo = mongoose.model("projectInfo", projectsInfoSchema);

module.exports = projectsInfo;
