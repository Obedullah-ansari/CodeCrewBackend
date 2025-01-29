const express = require("express");
const codeSolutionsController = require("./../controllers/codeSolutionsController");
const codeSolutionRoutes = express.Router();

codeSolutionRoutes
  .get("/getasolutions/:taskId", codeSolutionsController.getASolutionfortask)
  .post("/createsolutions/:taskId", codeSolutionsController.createCodeSolution);

module.exports = codeSolutionRoutes