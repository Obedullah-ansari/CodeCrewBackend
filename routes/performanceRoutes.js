const express = require("express");
const performanceController = require("../controllers/performanceController");
const authController = require("./../controllers/authController");
const performanceRoutes = express.Router();

performanceRoutes
  .get(
    "/auserperformace/:problemid",
    authController.protected,
    performanceController.getPerformance
  )
  .get(
    "/overallperf/:taskId",
    authController.protected,
    performanceController.updateTaskPerformance
  )
  .get(
    "/getallperformance",
    authController.protected,
    performanceController.getAllPerformance
  );
  

module.exports = performanceRoutes;
