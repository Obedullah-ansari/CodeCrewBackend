const multer = require("multer");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const resources = require("../models/resourceModal");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage (no local file saving)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image");

exports.uploadBasicImage = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("Image upload failed", 500));
    }

    const { problemid } = req.body;

    if (!problemid || !req.file) {
      return next(new AppError("Problem ID and image are required", 400));
    }

    try {
      cloudinary.uploader
        .upload_stream({ folder: "Basicimages" }, async (error, result) => {
          if (error) return next(new AppError("Cloudinary upload failed", 500));

          const resource = await resources.findOneAndUpdate(
            { problemid },
            { $push: { imagearray: result.secure_url } },
            { new: true, upsert: true }
          );

          res.status(200).json({
            status: "success",
            message: "Image uploaded and saved to resource successfully",
            imageUrl: result.secure_url,
            data: resource,
          });
        })
        .end(req.file.buffer);
    } catch (uploadErr) {
      return next(new AppError("Cloudinary upload failed", 500));
    }
  });
});
