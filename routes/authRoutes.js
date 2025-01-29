const express = require("express");
const authController = require("../controllers/authController");
const authRoutes = express.Router();

authRoutes
  .post("/signup", authController.signup)
  .post("/login", authController.login)
  .post("/forgetpassword", authController.forgetPassword)
  .patch("/resetpassword/:token", authController.resetPassword)
  .get("/resetpassword/:token", authController.renderResetPasswordPage);

module.exports = authRoutes;
