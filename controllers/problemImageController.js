const multer = require("multer");
const path = require("path");
const problemStatement = require("./../models/problemStatementModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Multer configuration for codeSolution images
const storageTask = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "problemStatementsUploads"); // Directory for codeSolution images
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `problemimage-${Date.now()}${ext}`);
  },
});

const uploadProblemImage = multer({ storage: storageTask }).single("image");

exports.uploadProblemImage = catchAsync(async (req, res, next) => {
  // Use Multer to handle file upload
  uploadProblemImage(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("Image upload failed", 500));
    }

    const { problemid } = req.body;
    
  

    if (!problemid) {
      return next(new AppError("problemid  is required", 400));
    }

    // Check if the problem and task exist
    const solution = await problemStatement.findOne({
      problemid,
    });


    if (!solution) {
      return next(new AppError("Solution or Task not found", 404));
    }

    // Update the demoimage field for the task
    const updatedSolution = await problemStatement.findOneAndUpdate(
       {problemid},
      { problemimage: `problemStatementsUploads/${req.file.filename}` },
      { new: true }
    );

    res.status(200).json({
      message: "problemStatement image uploaded successfully",
      updatedSolution,
    });
  });
});
