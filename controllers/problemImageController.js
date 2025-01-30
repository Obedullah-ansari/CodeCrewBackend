const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const problemStatement = require("./../models/problemStatementModel");
const dotenv = require("dotenv");
dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration for Cloudinary (using memory storage to send the file buffer)
const storageTask = multer.memoryStorage();

// File filter to allow only images (you can expand this to video or other types as needed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400), false);
  }
};

// Multer setup for single image upload
const uploadProblemImage = multer({
  storage: storageTask,
  fileFilter,
}).single("image");

exports.uploadProblemImage = catchAsync(async (req, res, next) => {
  // Use Multer to handle file upload
  uploadProblemImage(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("Image upload failed", 500));
    }

    // Ensure a file was uploaded
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const { problemid } = req.body;

    if (!problemid) {
      return next(new AppError("problemid is required", 400));
    }

    // Upload the image to Cloudinary
    try {
      const uploadResponse = await cloudinary.uploader.upload_stream(
        { resource_type: "image" }, // Cloudinary detects it as an image
        async (error, result) => {
          if (error) {
            return next(
              new AppError(`Cloudinary upload error: ${error.message}`, 500)
            );
          }

          const imageUrl = result.secure_url; // URL of the uploaded image

          // Check if the problem exists in the database
          const solution = await problemStatement.findOne({ problemid });

          if (!solution) {
            return next(new AppError("Problem not found", 404));
          }

          // Update the problem statement's image URL in the database
          const updatedSolution = await problemStatement.findOneAndUpdate(
            { problemid },
            { problemimage: imageUrl }, // Store the Cloudinary image URL
            { new: true }
          );

          res.status(200).json({
            message: "Problem statement image uploaded successfully",
            updatedSolution,
            filePath: imageUrl,
          });
        }
      );

      req.pipe(uploadResponse); // Pipe the file buffer to Cloudinary
    } catch (err) {
      return next(
        new AppError(`Error uploading to Cloudinary: ${err.message}`, 500)
      );
    }
  });
});
