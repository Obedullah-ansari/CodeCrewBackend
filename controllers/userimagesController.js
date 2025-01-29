const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const userPerformance = require("../models/performanceModal");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storageTask = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "userImages");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage: storageTask,
}).single("image");

exports.userImages = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("Image upload failed", 500));
    }

    const id = req.user._id;

    const user = await userPerformance.findOne({ userid: id });
    if (!user) {
      return next(new AppError("No user found with this ID", 404));
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "userImages",
      });
      await userPerformance.findOneAndUpdate(
        { userid: id },
        {
          $set: {
            userimage: result.secure_url,
          },
        },
        { new: true }
      );

      // Respond with success
      res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url, // Return the uploaded image URL
      });
    } catch (uploadErr) {
      return next(new AppError("Cloudinary upload failed", 500));
    }
  });
});

exports.deleteUserImage = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const user = await userPerformance.findOne({ userid: id });

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  if (!user.userimage) {
    return next(new AppError("No image found for this user", 404));
  }

  const imagePath = user.userimage.split("upload/")[1];

  const publicId = imagePath.split("/").slice(1).join("/").split(".")[0]; // Removing version and extension

  try {
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      await userPerformance.findOneAndUpdate(
        { userid: id },
        {
          $set: { userimage: "default.jpg" },
        },
        { new: true }
      );

      res.status(200).json({
        message: "Image deleted successfully",
      });
    } else {
      return next(new AppError("Cloudinary image deletion failed", 500));
    }
  } catch (err) {
    return next(new AppError("Image deletion failed", 500));
  }
});
