const express = require("express");
const CodeCrewAiController = require("../controllers/CodeCrewAiController");
const aiRoutes = express.Router();

aiRoutes.post("/askai", CodeCrewAiController.CodeCrewAi);

module.exports = aiRoutes;
