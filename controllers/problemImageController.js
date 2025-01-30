const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const problemStatement = require("./../models/problemStatementModel");
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storageTask = multer.memoryStorage(); // Using memory storage

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400), false);
  }
};

const uploadProblemImage = multer({
  storage: storageTask,
  fileFilter,
}).single("image");

exports.uploadProblemImage = catchAsync(async (req, res, next) => {
  uploadProblemImage(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("Image upload failed", 500));
    }

    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const { problemid } = req.body;

    if (!problemid) {
      return next(new AppError("problemid is required", 400));
    }

    try {
      // Upload file buffer directly to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "Problemimages" },
        async (error, result) => {
          if (error) {
            return next(
              new AppError(
                `Error uploading to Cloudinary: ${error.message}`,
                500
              )
            );
          }

          // Get Cloudinary URL of the uploaded image
          const imageUrl = result.secure_url;

          // Check if problem exists in the database
          const solution = await problemStatement.findOne({ problemid });

          if (!solution) {
            return next(new AppError("Problem not found", 404));
          }

          // Update the problem statement with the Cloudinary image URL
          const updatedSolution = await problemStatement.findOneAndUpdate(
            { problemid },
            { problemimage: imageUrl }, // Store Cloudinary URL
            { new: true }
          );

          res.status(200).json({
            message: "Problem statement image uploaded successfully",
            updatedSolution,
            filePath: imageUrl,
          });
        }
      );

      // Pipe the file buffer to Cloudinary upload stream
      uploadStream.end(req.file.buffer); // End the stream with the buffer
    } catch (err) {
      return next(
        new AppError(`Error uploading to Cloudinary: ${err.message}`, 500)
      );
    }
  });
});
