const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const badgesData = require("../models/badgesModel")


exports.uploadNewBadges = catchAsync(async (req, res, next) => {

    const { name, credits, badges } = req.body;
    const newBadge = await badgesData.create({
      name,
      credits,
      badges,
    });

    res.status(201).json({
      status: "success",
      message: "Badge uploaded successfully.",
      data: newBadge,
    });
 
});
