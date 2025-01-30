const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const problemStatement = require("../models/problemStatementModel");
const codeSolution = require("../models/codeSolutionsModal");




exports.getASolutionfortask = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;

  const taskSolution = await codeSolution.findOne({
    "tasks_solution.taskId": taskId,
  });
  if (!taskSolution)
    return next(new AppError("no solution for this task exist"));

  const specificTask = taskSolution.tasks_solution.find(
    (task) => task.taskId === taskId
  );

  if (!specificTask) {
    return next(new AppError("Task not found in the solutions", 404));
  }

  res.status(200).json({
    status: "success",
    specificTask,
  });
});

//creat and update
exports.createCodeSolution = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const { code } = req.body;

  const problem = await problemStatement.findOne({
    "multipletask._id": taskId,
  });

  if (!problem) {
    return next(new AppError("No task exists with this taskId", 404));
  }

  const projectname = problem.projectname;
  const problemid = problem.problemid;

  let solutionDoc = await codeSolution.findOne({ projectname, problemid });

  if (!solutionDoc) {
    // Step 4: If no document exists, create a new one
    solutionDoc = await codeSolution.create({
      projectname,
      problemid,
      tasks_solution: [
        {
          taskId,
          code: code.map((c) => ({
            codetype: c.codetype,
            code: c.code,
          })),
        },
      ],
    });
  } else {
    // Step 5: Update the existing document
    const taskIndex = solutionDoc.tasks_solution.findIndex(
      (task) => task.taskId === taskId
    );

    if (taskIndex !== -1) {
      // Update the existing task's code array
      solutionDoc.tasks_solution[taskIndex].code = code.map((c) => ({
        codetype: c.codetype,
        code: c.code,
      }));
    } else {
      // Add a new task entry if taskId doesn't exist
      solutionDoc.tasks_solution.push({
        taskId,
        demoimage :req.body.demoimage,
        code: code.map((c) => ({
          codetype: c.codetype,
          code: c.code,
        })),
      });
    }

    // Save the updated document
    await solutionDoc.save();
  }

  // Step 6: Respond to the client
  res.status(201).json({
    status: "success",
    solutionDoc,
  });
});
