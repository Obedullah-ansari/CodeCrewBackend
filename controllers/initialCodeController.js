const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const initialCode = require("../models/initialCodeModal");
const userCode = require("./../models/userCodeModal");

exports.getASolutionfortask = catchAsync(async (req, res, next) => {
  const { problemid } = req.params;
  const userid = req.user.id;
  const recentTask = await initialCode.findOne({
    userid,
  });
  if (!recentTask) return next(new AppError("no recent  task exist"));

  let specificTask = recentTask.initialusercode.find((userrecentcode) => {
    return userrecentcode.problemid === problemid;
  });

  if (!specificTask) {
    return next(new AppError("Task not found in the solutions", 404));
  }

  specificTask = specificTask.code;

  res.status(200).json({
    status: "success",
    specificTask,
  });
});

//creat and update
exports.createInitialUserCode = catchAsync(async (req, res, next) => {
  const { problemid } = req.params;
  const userId = req.user.id;

  // Step 1: Find user-coded details
  const usercodedetails = await userCode.findOne({ userid: userId });
  if (!usercodedetails) {
    return next(new AppError("No user exists with this userid", 404));
  }

  // Step 2: Find or create initialCodeData
  let initialCodeData = await initialCode.findOne({ userid: userId });
  if (!initialCodeData) {
    initialCodeData = new initialCode({
      userid: userId,
      initialusercode: [],
    });
  }

  // Step 3: Find specific problem
  const array = usercodedetails.projectProgress.find(
    (specificProblem) => String(specificProblem.problemid) === String(problemid)
  );

  if (!array || !array.tasks || array.tasks.length === 0) {
    return next(
      new AppError(
        "No problem found with this problemid or no tasks exist",
        404
      )
    );
  }

  // Step 4: Get the most recent code
  const length = array.tasks.length;
  const userRecentCode = array.tasks[length - 1]?.code || [];

  if (userRecentCode.length === 0) {
    return next(new AppError("No recent code found for this problem", 404));
  }

  // Step 5: Update initialCodeData
  const existingProblemIndex = initialCodeData.initialusercode.findIndex(
    (entry) => String(entry.problemid) === String(problemid)
  );

  if (existingProblemIndex > -1) {
    initialCodeData.initialusercode[existingProblemIndex].code = userRecentCode;
  } else {
    initialCodeData.initialusercode.push({
      problemid: problemid,
      code: userRecentCode,
    });
  }

  await initialCodeData.save();

  const specificProblemInitialCode = initialCodeData.initialusercode.find(
    (recentdata) => String(recentdata.problemid) === String(problemid)
  );

  res.status(200).json({
    status: "success",
    data: specificProblemInitialCode,
  });
});
