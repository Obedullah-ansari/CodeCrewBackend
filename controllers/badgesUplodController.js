const multer = require("multer");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const badgesData = require("../models/badgesModel");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() }).single("image");

exports.uploadBadges = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(new AppError("Image upload failed", 500));
    if (!req.body.id || !req.file)
      return next(new AppError("Badge ID and image are required", 400));

    cloudinary.uploader
      .upload_stream({ folder: "Badges" }, async (error, result) => {
        if (error) return next(new AppError("Cloudinary upload failed", 500));

        const updatedBadgesData = await badgesData.findOneAndUpdate(
          { _id: req.body.id },
          { $set: { badges: result.secure_url } },
          { new: true }
        );

        res.status(200).json({
          status: "success",
          message: "Badge uploaded successfully",
          imageUrl: result.secure_url,
          data: updatedBadgesData,
        });
      })
      .end(req.file.buffer);
  });
});
