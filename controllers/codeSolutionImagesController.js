const multer = require("multer");
const path = require("path");
const codeSolution = require("../models/codeSolutionsModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Multer storage configuration
const storageTask = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/codeSolutions"); // Directory for files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `task-${Date.now()}${ext}`);
  },
});

// File filter to allow only images and videos
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

    // Update the demoimage field for both image and video
    const updatedSolution = await codeSolution.findOneAndUpdate(
      { problemid, "tasks_solution.taskId": taskid },
      {
        $set: {
          "tasks_solution.$.demoimage": `uploads/codeSolutions/${req.file.filename}`,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: `File uploaded successfully: ${req.file.filename}`,
      updatedSolution,
    });
  });
});
