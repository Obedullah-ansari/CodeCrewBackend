const express = require("express");
const problemStatementController = require("./../controllers/problemStatementController");
const problemRoutes = express.Router();

problemRoutes
  .post(
    "/problemstatement/:projectId",
    problemStatementController.projectProblemStatement
  )
  .patch(
    "/problemupdate/:projectId",
    problemStatementController.updateProblemStatement
  )
  .get(
    "/getproblembyid/:projectId",
    problemStatementController.getProjectproblemById
  );

module.exports = problemRoutes;
