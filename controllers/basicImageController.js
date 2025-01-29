const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const resources = require("../models/resourceModal");

const storageTask = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `codecrewbasic-${Date.now()}${ext}`);
  },
});

const uploadBasicImage = multer({ storage: storageTask }).single("image");

exports.uploadBasicImage = catchAsync(async (req, res, next) => {
  uploadBasicImage(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("Image upload failed", 500));
    }

    const { problemid } = req.body;
    const imagePath = req.file?.path;

    if (!problemid || !imagePath) {
      return next(new AppError("Problem ID and image are required", 400));
    }

    const resource = await resources.findOneAndUpdate(
      { problemid },
      { $push: { imagearray: imagePath } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: "success",
      message: "Basic image uploaded and saved to resource successfully",
      data: resource,
    });
  });
});
