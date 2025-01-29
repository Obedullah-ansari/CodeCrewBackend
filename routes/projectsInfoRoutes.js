const express = require("express");
const projectsController = require("./../controllers/projectsController");

const projectsInfo = express.Router();

projectsInfo
    .get("/allprojectinfo", projectsController.getAllProjectsInfo)
    .post("/createprojects", projectsController.createProjects)
    .delete("/deleteprojectby/:id", projectsController.deleteProjectsById)
    .patch("/updateproject/:id", projectsController.updateProjectById)
    .get("/searchprojects", projectsController.searchProjects);

module.exports = projectsInfo;
