const express = require("express");
const codeSolutionImagesController = require("../controllers/codeSolutionImagesController");
const problemImageController = require("./../controllers/problemImageController");
const basicmimages = require("./../controllers/basicImageController");
const badgesUploadController = require("./../controllers/badgesUplodController");
const userImagesController = require("./../controllers/userimagesController");
const authController = require("./../controllers/authController");
const resourceController = require("./../controllers/resourcesController");
const codeSolimageRoutes = express.Router();

codeSolimageRoutes
  .post("/codesolimages", codeSolutionImagesController.uploadTaskMedia)
  .post("/problemimages", problemImageController.uploadProblemImage)
  .post("/basicimages", basicmimages.uploadBasicImage)
  .post("/badges", badgesUploadController.uploadBadges)
  .post(
    "/userimageuploads",
    authController.protected,
    userImagesController.userImages
  )
  .post(
    "/deleteuser",
    authController.protected,
    userImagesController.deleteUserImage
  )
  .get("/resources/:problemid", resourceController.getResources);

module.exports = codeSolimageRoutes;
