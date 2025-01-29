const express = require("express");
const userCode = require("./../models/userCodeModal");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const problemStatement = require("../models/problemStatementModel");

exports.getUserSolution = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;

  const userId = req.user.id;


  if (!userId) {
    return next(new AppError("No user exists with this ID", 404));
  }

  // Query to find the specific task solution
  const userTaskSolution = await userCode.findOne({
    userid: userId,
  });

  if (!userTaskSolution) {
    return next(new AppError("No task solution exists with this ID", 404));
  }

  let specificTask = null;
  userTaskSolution.projectProgress.forEach((project) => {
    if (project.tasks && Array.isArray(project.tasks)) {
      const task = project.tasks.find((t) => t.taskId === taskId);
      if (task) {
        specificTask = task;
      }
    }
  });

  if (!specificTask) {
    return next(new AppError("Task not found in the solutions", 404));
  }

  // Send the specific task in the response
  res.status(200).json({
    status: "success",
    specificTask, // Return only the specific task
  });
});

exports.userSolution = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const { code } = req.body;
  const userId = req.user.id;

  if (!userId) return next(new AppError("no userexist with this id"));

  // Step 1: Find the problem statement with the given taskId
  const problem = await problemStatement.findOne({
    "multipletask._id": taskId,
  });

  if (!problem) {
    return next(new AppError("No task exists with this taskId", 404));
  }

  const projectname = problem.projectname;
  const problemid = problem.problemid;
  const problemdifficulty = problem.problemdifficulty
  const problemtags = problem.problemtags


  // Step 2: Find or create a userCode document for the user
  let userCodeDoc = await userCode.findOne({ userid: userId });

  if (!userCodeDoc) {
    // Create a new userCode document if it doesn't exist
    userCodeDoc = await userCode.create({
      userid: userId,
      projectProgress: [
        {
          problemtags,
          projectname,
          problemid,
          problemdifficulty,
          tasks: [
            {
              taskId,
              code: code.map((c) => ({
                codetype: c.codetype,
                code: c.code,
              })),
              completed: false,
            },
          ],
        },
      ],
    });
  } else {
    // Step 3: Update an existing userCode document
    const projectIndex = userCodeDoc.projectProgress.findIndex(
      (project) =>
        project.projectname.toString() === projectname.toString() &&
        project.problemid.toString() === problemid.toString()
    );

    if (projectIndex !== -1) {
      // Find the task within the project
      const taskIndex = userCodeDoc.projectProgress[
        projectIndex
      ].tasks.findIndex((task) => task.taskId.toString() === taskId.toString());

      if (taskIndex !== -1) {
        // Update existing task
        userCodeDoc.projectProgress[projectIndex].tasks[taskIndex].code =
          code.map((c) => ({
            codetype: c.codetype,
            code: c.code,
          }));
      } else {
        // Add new task if it doesn't exist
        userCodeDoc.projectProgress[projectIndex].tasks.push({
          taskId,
          code: code.map((c) => ({
            codetype: c.codetype,
            code: c.code,
          })),
          completed: false,
        });
      }
    } else {
      // Add new project if it doesn't exist
      userCodeDoc.projectProgress.push({
        problemtags,
        projectname,
        problemid,
        problemdifficulty,
        tasks: [
          {
            taskId,
            code: code.map((c) => ({
              codetype: c.codetype,
              code: c.code,
            })),
            completed: false,
          },
        ],
      });
    }

    // Save the updated userCode document
    await userCodeDoc.save();
  }

  // Step 4: Respond to the client
  res.status(201).json({
    status: "success",
    userCode: userCodeDoc,
  });
});
