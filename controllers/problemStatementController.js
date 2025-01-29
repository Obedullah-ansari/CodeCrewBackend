const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const problemStatement = require("./../models/problemStatementModel");
const projectsInfo = require("./../models/projectModel");

//get a project bt id
exports.getProjectproblemById = catchAsync(async (req, res, next) => {
  //this is probleminfoid from probleminfo schema _id
  const projectId = req.params.projectId;

  const problemInfo = await problemStatement.findOne({
    problemid: projectId,
  });
  if (!problemInfo)
    return next(new AppError("problem with this id is not exist "), 404);

  res.status(200).json({
    status: "success",
    problemInfo,
  });
});

//post
exports.projectProblemStatement = catchAsync(async (req, res, next) => {
  //this is projectinfoid from  projectinfo schema
  const projectId = req.params.projectId;

  const projectInfo = await projectsInfo.findById(projectId);

  if (!projectInfo) {
    return next(new AppError("No project found with this ID", 404));
  }
  const newProblemStatement = await problemStatement.create({
    problemid: projectInfo._id,
    projectname: projectInfo.projectTitle,
    credits: projectInfo.credits,
    problemtags: projectInfo.projectTags,
    problemdifficulty: projectInfo.difficulty,
    problemmainstatement: req.body.problemmainstatement,
    problemsubstatement: req.body.problemsubstatement || "",
    problemimage: req.body.problemimage || "",
    multipletask: req.body.multipletask || [],
    overallperformance: req.body.overallperformance || 0,
  });

  // Send the response
  res.status(201).json({
    status: "success",
    newProblemStatement,
  });
});

//update
exports.updateProblemStatement = catchAsync(async (req, res, next) => {
  const projectId = req.params.projectId;

  // Find the existing problem statement
  const existingProblemStatement = await problemStatement.findOne({
    problemid: projectId,
  });

  if (!existingProblemStatement) {
    return next(
      new AppError("No problem statement found for this project ID", 404)
    );
  }

  // Update the problem statement with new data
  existingProblemStatement.projectname =
    req.body.projectname || existingProblemStatement.projectname;
  existingProblemStatement.credits =
    req.body.credits || existingProblemStatement.credits;
  existingProblemStatement.problemtags =
    req.body.problemtags || existingProblemStatement.problemtags;
  existingProblemStatement.problemdifficulty =
    req.body.problemdifficulty || existingProblemStatement.problemdifficulty;
  existingProblemStatement.problemmainstatement =
    req.body.problemmainstatement ||
    existingProblemStatement.problemmainstatement;
  existingProblemStatement.problemsubstatement =
    req.body.problemsubstatement ||
    existingProblemStatement.problemsubstatement;
  existingProblemStatement.problemimage =
    req.body.problemimage || existingProblemStatement.problemimage;
  existingProblemStatement.multipletask =
    req.body.multipletask || existingProblemStatement.multipletask;
  existingProblemStatement.overallperformance =
    req.body.overallperformance || existingProblemStatement.overallperformance;

  await existingProblemStatement.save();

  res.status(200).json({
    status: "success",
    updatedProblemStatement: existingProblemStatement,
  });
});
