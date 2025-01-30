const multer = require("multer");
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

// Use Multer with Cloudinary Storage
const storage = multer.memoryStorage(); // No local storage, upload directly
const upload = multer({ storage }).single("image");

// Upload Image to Cloudinary
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
      const result = await cloudinary.uploader
        .upload_stream({ folder: "userImages" }, async (error, result) => {
          if (error) return next(new AppError("Cloudinary upload failed", 500));

          await userPerformance.findOneAndUpdate(
            { userid: id },
            { $set: { userimage: result.secure_url } },
            { new: true }
          );

          res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url, // Return Cloudinary image URL
          });
        })
        .end(req.file.buffer);
    } catch (uploadErr) {
      return next(new AppError("Cloudinary upload failed", 500));
    }
  });
});

// Delete Image from Cloudinary
exports.deleteUserImage = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const user = await userPerformance.findOne({ userid: id });

  if (!user) {
    return next(new AppError("No user found with this ID", 404));
  }

  if (!user.userimage) {
    return next(new AppError("No image found for this user", 404));
  }

  const publicId = user.userimage.split("/").pop().split(".")[0]; // Extract Cloudinary public ID

  try {
    const result = await cloudinary.uploader.destroy(`userImages/${publicId}`);

    if (result.result === "ok") {
      await userPerformance.findOneAndUpdate(
        { userid: id },
        { $set: { userimage: "default.jpg" } },
        { new: true }
      );

      res.status(200).json({ message: "Image deleted successfully" });
    } else {
      return next(new AppError("Cloudinary image deletion failed", 500));
    }
  } catch (err) {
    return next(new AppError("Image deletion failed", 500));
  }
});
