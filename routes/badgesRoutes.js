const express = require("express");
const badgesController = require("../controllers/badgesController");
const badgesRoutes = express.Router();

badgesRoutes
  .post("/newbadge", badgesController.uploadNewBadges)


module.exports = badgesRoutes;
