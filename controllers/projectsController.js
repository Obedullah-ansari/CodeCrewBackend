const projectsInfo = require("./../models/projectModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const API_filtering = require("./../utils/apiFeatures");

exports.getAllProjectsInfo = catchAsync(async (req, res, next) => {
  const features = new API_filtering(projectsInfo.find(), req.query)
    .filter()
    .sort()
    .paginate();
  const projects = await features.query;

  if (!projects || projects.length === 0) {
    return next(new AppError("Project information is not available", 404));
  }

  res.status(200).json({
    status: "succcess",
    totalprojects: projects.length,
    projects,
  });
});

exports.createProjects = catchAsync(async (req, res, next) => {
  const newProject = await projectsInfo.create({
    projectTitle: req.body.projectTitle,
    projectdescription: req.body.projectdescription,
    projectTags: req.body.projectTags,
    difficulty: req.body.difficulty,
    credits: req.body.credits,
    active: req.body.active,
  });

  res.status(200).json({
    status: "success",
    newProject,
  });
});

exports.updateProjectById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const updates = { ...req.body };

  const updatedProjectInfo = await projectsInfo.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedProjectInfo) {
    return next(new AppError("No project found with this ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: updatedProjectInfo,
  });
});

exports.deleteProjectsById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const result = await projectsInfo.deleteOne({ _id: id });
  if (result.deletedCount === 0)
    return next(
      new AppError(`No projects is available with this id:${id}`),
      404
    );

  res.status(200).json({
    status: "success",
    message: "project information is deleted successfully",
  });
});
// basic seacrh login for project search
exports.searchProjects = catchAsync(async (req, res, next) => {
  const { query } = req; // Get the query parameters from the request
  const searchTag = query.tag; // Extract the tag parameter (e.g., ?tag=html)

  if (!searchTag) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide a tag to search for.",
    });
  }

  // Find projects where projectTags array contains the specified tag
  const projects = await projectsInfo.find({
    projectTags: { $regex: searchTag, $options: "i" }, // Case-insensitive match
  });

  if (projects.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No projects found with the specified tag.",
    });
  }

  res.status(200).json({
    status: "success",
    results: projects.length,
    data: projects,
  });
});
