const express = require("express");
const initialCodeController = require("./../controllers/initialCodeController");
const initilaCodeSolution = express.Router();
const authController = require("./../controllers/authController");

initilaCodeSolution
  .get(
    "/initialcode/:problemid",
    authController.protected,
    initialCodeController.getASolutionfortask
  )
  .post(
    "/createinitialcode/:problemid",
    authController.protected,
    initialCodeController.createInitialUserCode
  );

module.exports = initilaCodeSolution;
