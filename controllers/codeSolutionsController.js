const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier"); // Required for buffer streaming
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const codeSolution = require("../models/codeSolutionsModal");
const dotenv = require("dotenv");

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage for Cloudinary
const storageTask = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/mov",
    "video/quicktime",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400), false);
  }
};

const uploadTaskMedia = multer({
  storage: storageTask,
  fileFilter,
}).single("file");

exports.uploadTaskMedia = catchAsync(async (req, res, next) => {
  uploadTaskMedia(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Multer error: ${err.message}`, 500));
    } else if (err) {
      return next(err);
    }

    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const { problemid, taskid } = req.body;
    if (!problemid || !taskid) {
      return next(new AppError("problemid and taskid are required", 400));
    }

    // Check if the problem and task exist
    const solution = await codeSolution.findOne({
      problemid,
      "tasks_solution.taskId": taskid,
    });

    if (!solution) {
      return next(new AppError("Solution or Task not found", 404));
    }

    try {
      // Determine Cloudinary resource type
      const isVideo = req.file.mimetype.startsWith("video");

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "SolutionVideos",
          resource_type: isVideo ? "video" : "image", // Explicitly set resource type
        },
        async (error, cloudinaryResult) => {
          if (error) {
            return next(
              new AppError(`Cloudinary error: ${error.message}`, 500)
            );
          }

          // Update database with Cloudinary URL
          const updatedSolution = await codeSolution.findOneAndUpdate(
            { problemid, "tasks_solution.taskId": taskid },
            {
              $set: {
                "tasks_solution.$.demoimage": cloudinaryResult.secure_url,
              },
            },
            { new: true }
          );

          res.status(200).json({
            message: `File uploaded successfully: ${cloudinaryResult.secure_url}`,
            updatedSolution,
          });
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
      return next(
        new AppError(`Error uploading to Cloudinary: ${err.message}`, 500)
      );
    }
  });
});
