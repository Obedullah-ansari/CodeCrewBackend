const express = require("express");
const userCodeController = require("./../controllers/userCodeController");
const auhtController = require("./../controllers/authController");
const userCodeRoutes = express.Router();


userCodeRoutes
  .get(
    "/getusercode/:taskId",
    auhtController.protected,
    userCodeController.getUserSolution
  )
  .post(
    "/usercodesubmit/:taskId",
    auhtController.protected,
    userCodeController.userSolution
  );


module.exports = userCodeRoutes