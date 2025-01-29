const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const badgesData = require("./../models/badgesModel")

// Multer configuration for codeSolution images
const storageTask = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "badgesUploads"); // Directory for codeSolution images
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `badges-${Date.now()}${ext}`);
  },
});

const uploadBadges = multer({ storage: storageTask }).single("image");

exports.uploadBadges = catchAsync(async (req, res, next) => {
  // Use Multer to handle file upload
  uploadBadges(req, res, async (err) => {
    if (err) {
      console.log(err);
      return next(new AppError("Image upload failed", 500));
    }
      const { id } = req.body
      
      const badges = await badgesData.findOne({_id :id})
      
      if (!badges)
          return next(new AppError("no badgesdata is found with this id "))
      
       const updatedBadgesData = await badgesData.findOneAndUpdate(
         { _id : id },
         {
           $set: {
             "badges": `badgesUploads/${req.file.filename}`,
           },
         },
         { new: true }
       );
      
    res.status(200).json({
        message: "success",
        updatedBadgesData
    });
  });
});
