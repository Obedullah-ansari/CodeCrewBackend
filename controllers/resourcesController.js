const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const resources = require("../models/resourceModal");

exports.getResources = catchAsync(async (req, res, next) => {
    const problemid = req.params.problemid

  const resourcesData = await resources.findOne({ problemid });
  if (!resourcesData)
    return next(new AppError("no resources found with this id", 404));

  const imageArray = resourcesData.imagearray;

  res.status(200).json({
    status: " success",
    imageArray,
  });
});
