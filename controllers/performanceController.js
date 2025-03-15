const catchAsync = require("../utils/catchAsync");
const userCode = require("../models/userCodeModal");
const codeSolution = require("../models/codeSolutionsModal");
const problemStatement = require("../models/problemStatementModel");
const userPerformance = require("../models/performanceModal");
const AppError = require("../utils/appError");
const Auth = require("./../models/authModel");
const badgesData = require("./../models/badgesModel");
const esprima = require("esprima");

function compareHTML(userHTML, solutionHTML) {
  let matchPercentage = 0;

  if (userHTML === solutionHTML) {
    return 100;
  }

  const userTags = userHTML.match(/<([a-zA-Z0-9]+)[^>]*>/g) || [];
  const solutionTags = solutionHTML.match(/<([a-zA-Z0-9]+)[^>]*>/g) || [];
  const matchingTags = userTags.filter((tag) => solutionTags.includes(tag));

  matchPercentage = (matchingTags.length / solutionTags.length) * 100;
  if (matchPercentage > 100) return 100;

  return matchPercentage;
}

function compareCSS(userCSS, solutionCSS) {
  let matchPercentage = 0;

  if (userCSS === solutionCSS) {
    return 100;
  }

  const userSelectors = userCSS.match(/[a-zA-Z0-9#,.]+(?=\s*\{)/g) || [];
  const solutionSelectors =
    solutionCSS.match(/[a-zA-Z0-9#,.]+(?=\s*\{)/g) || [];
  const matchingSelectors = userSelectors.filter((sel) =>
    solutionSelectors.includes(sel)
  );

  matchPercentage = (matchingSelectors.length / solutionSelectors.length) * 100;
  if (matchPercentage > 100) return 100;

  return matchPercentage;
}

function compareJavaScript(userJS, solutionJS) {
  const userAST = esprima.parseScript(userJS);
  const solutionAST = esprima.parseScript(solutionJS);

  let matchPercentage = 0;

  if (JSON.stringify(userAST) === JSON.stringify(solutionAST)) {
    return 100;
  }
  const userFunctions = userAST.body.filter(
    (node) => node.type === "FunctionDeclaration"
  );
  const solutionFunctions = solutionAST.body.filter(
    (node) => node.type === "FunctionDeclaration"
  );

  const matchingFunctions = userFunctions.filter((userFunc) =>
    solutionFunctions.some(
      (solutionFunc) => solutionFunc.id.name === userFunc.id.name
    )
  );

  matchPercentage = (matchingFunctions.length / solutionFunctions.length) * 100;
  return matchPercentage;
}

exports.getPerformance = catchAsync(async (req, res, next) => {
  const { problemid } = req.params;
  userId = req.user.id;
  const performanceData = await userPerformance.findOne({
    userid: userId,
  });
  if (!performanceData)
    return next(
      new AppError(
        "no user performance data exist for thsi problemid or may be user not signin",
        404
      )
    );

  const taskArry = performanceData.multipletask.find((problem) => {
    return problem.problemid === problemid;
  });

  if (!taskArry)
    return next(new AppError("Performance task array is not found", 404));

  res.status(200).json({
    status: "success",
    taskArry,
  });
});

exports.getAllPerformance = catchAsync(async (req, res, next) => {
  userId = req.user.id;
  const performanceData = await userPerformance.findOne({
    userid: userId,
  });
  if (!performanceData)
    return next(
      new AppError(
        "no user performance data exist for thsi problemid or may be user not signin",
        404
      )
    );

  res.status(200).json({
    status: "success",
    performanceData,
  });
});

exports.updateTaskPerformance = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const userid = req.user.id;

  const problem = await problemStatement.findOne({
    "multipletask._id": taskId,
  });

  if (!problem)
    return next(new AppError("Problem not found for the given task", 404));

  const { problemid, projectname } = problem;

  const userCodeData = await userCode.findOne({ userid });
  if (!userCodeData) return next(new AppError("User code data not found", 404));

  const projectProgress = userCodeData.projectProgress.find(
    (project) => project.projectname === projectname
  );

  if (!projectProgress)
    return next(new AppError("Project progress not found for the user", 404));

  const userTask = projectProgress.tasks.find((t) => t.taskId === taskId);
  if (!userTask)
    return next(new AppError("User task not found for the given task ID", 404));

  const solution = await codeSolution.findOne({ projectname, problemid });
  if (!solution)
    return next(new AppError("Solution not found for the given problem", 404));

  const solutionTask = solution.tasks_solution.find((t) => t.taskId === taskId);
  if (!solutionTask)
    return next(
      new AppError("Solution task not found for the given task ID", 404)
    );

  const matchPercentages = solutionTask.code.map((solutionCode) => {
    const userCodeBlock = userTask.code.find(
      (c) => c.codetype === solutionCode.codetype
    );

    if (!userCodeBlock) return 0;

    switch (solutionCode.codetype) {
      case "html":
        return compareHTML(userCodeBlock.code.trim(), solutionCode.code.trim());
      case "css":
        return compareCSS(userCodeBlock.code.trim(), solutionCode.code.trim());
      case "javascript":
        return compareJavaScript(
          userCodeBlock.code.trim(),
          solutionCode.code.trim()
        );
      default:
        return 0;
    }
  });

  const validPercentages = matchPercentages.filter((val) => !isNaN(val));
  const totalPercentage =
    validPercentages.length > 0
      ? validPercentages.reduce((sum, val) => sum + val, 0) /
        validPercentages.length
      : 0;

  if (totalPercentage < 50) {
    return res.status(200).json({
      message:"success",
    });
  }


  let userPerformanceData = await userPerformance.findOne({ userid });

  if (!userPerformanceData) {
    userPerformanceData = new userPerformance({
      userid,
      multipletask: [
        {
          problemid: String(problemid),
          task: problem.multipletask.map((task) => ({
            taskId: task._id,
            complete: "pending",
            performance: 0,
          })),
        },
      ],
    });

    await userPerformanceData.save();
  } else {
    // Check if the problemid already exists in the multipletask array
    const existingProblem = userPerformanceData.multipletask.find(
      (taskGroup) => taskGroup.problemid === String(problemid)
    );
    if (!existingProblem) {
      // If the problemid doesn't exist, add a new entry
      userPerformanceData.multipletask.push({
        problemid: String(problemid),
        task: problem.multipletask.map((task) => ({
          taskId: task._id,
          complete: "pending",
          performance: 0,
        })),
      });
    }

    await userPerformanceData.save();
  }

  // Update specific task performance and completion status
  const multipleTask = userPerformanceData.multipletask.find(
    (taskGroup) => taskGroup.problemid === String(problemid)
  );

  if (multipleTask) {
    const taskToUpdate = multipleTask.task.find((t) => t.taskId === taskId);

    if (taskToUpdate) {
      taskToUpdate.complete = "complete";
      taskToUpdate.performance = totalPercentage;
    } else {
      return next(new AppError("Task not found in user performance", 404));
    }
  } else {
    return next(
      new AppError("Problem ID not found in user performance data", 404)
    );
  }

  userPerformanceData.currentlyworking =
    userCodeData.projectProgress[
      userCodeData.projectProgress.length - 1
    ].projectname;

  await userPerformanceData.save();
  await updateUserDetails(userid);
  await helperFunction(userid, problemid);

  res.status(200).json({
    message:
      "Congratulation you have completed this task you can track your progress and performace in project section ",
  });
});

const helperFunction = catchAsync(async (userid, problemid) => {
  try {
    const taskCompletionArray = await userPerformance.findOne({
      userid,
    });

    const specificTaskArray = taskCompletionArray.multipletask.find(
      (userTask) => {
        return userTask.problemid.toString() === problemid.toString();
      }
    );

    let length = 0;
    let taskArrayLength = specificTaskArray.task.length;

    specificTaskArray.task.forEach((temp) => {
      if (temp.complete.trim() === "complete") {
        length = length + 1;
      }
    });
    if (length === taskArrayLength && !specificTaskArray.iscompleted) {
      specificTaskArray.iscompleted = true;
      await taskCompletionArray.save();

      // Call progress update functions after marking the task as completed
      await updateLanguageProgress(userid, problemid);
      await updateProjectProgress(userid);
      await awardsBadges(userid, problemid);
    }
  } catch (err) {
    console.log(err);
  }
});

const updateLanguageProgress = async (userid, problemid) => {
  try {
    const userCodeData = await userCode.findOne({ userid });

    const project = userCodeData.projectProgress.find(
      (proj) => proj.problemid.toString() === problemid.toString()
    );

    const { problemtags, problemdifficulty } = project;

    let progressIncrement;
    switch (problemdifficulty) {
      case "easy":
        progressIncrement = 1;
        break;
      case "medium":
        progressIncrement = 1.8;
        break;
      case "hard":
        progressIncrement = 2.5;
        break;
    }

    const userPerformanceData = await userPerformance.findOne({ userid });

    problemtags.forEach((tag) => {
      const language = userPerformanceData.Progress.find(
        (lang) => lang.languagename === tag
      );

      if (language) {
        language.languageprogress += progressIncrement;
        language.languageprogress = parseFloat(
          language.languageprogress.toFixed(2)
        );
      } else {
        userPerformanceData.Progress.push({
          languagename: tag,
          languageprogress: progressIncrement,
        });
      }
    });

    await userPerformanceData.save();
  } catch (err) {
    console.log(err);
  }
};

//difficulty types

const updateProjectProgress = async (userid) => {
  try {
    const response = await userCode.findOne({
      userid,
    });

    const length = response.projectProgress.length;
    let easy = 0,
      medium = 0,
      hard = 0;

    response.projectProgress.forEach((project) => {
      if (project.problemdifficulty === "easy") easy = easy + 1;
      else if (project.problemdifficulty === "medium") medium = medium + 1;
      else if (project.problemdifficulty === "hard") hard = hard + 1;
    });

    const userperformancedata = await userPerformance.findOne({
      userid,
    });

    userperformancedata.totalprojectdone = length;
    userperformancedata.easy = easy;
    userperformancedata.medium = medium;
    userperformancedata.hard = hard;
    await userperformancedata.save();
  } catch (err) {
    console.log(err);
  }
};

const updateUserDetails = catchAsync(async (id) => {
  try {
    const userId = id;

    const auth = await Auth.findOne({
      _id: userId,
    });

    const userperformancedata = await userPerformance.findOne({
      userid: userId,
    });

    userperformancedata.username = auth.name;
    userperformancedata.useremail = auth.email;

    await userperformancedata.save();
  } catch (err) {
    console.log(err);
  }
});

const awardsBadges = async (userid, problemid) => {
  try {
    const taskCompletionArray = await userPerformance.findOne({ userid });
    const problem = await problemStatement.findOne({ problemid });

    const credit = Number(problem.credits);
    taskCompletionArray.credits = (taskCompletionArray.credits || 0) + credit;

    const allBadges = await badgesData.find();

    if (!Array.isArray(taskCompletionArray.badges)) {
      taskCompletionArray.badges = [];
    }

    allBadges.forEach((givebadges) => {
      if (userid && !taskCompletionArray.badges.includes(allBadges[0].badges)) {
        taskCompletionArray.badges.push(allBadges[0].badges);
      }
      if (
        taskCompletionArray.credits === Number(givebadges.credits) &&
        !taskCompletionArray.badges.includes(givebadges.badges)
      ) {
        taskCompletionArray.badges.push(givebadges.badges);
      }
    });

    taskCompletionArray.nextbadgecredit =
      allBadges[taskCompletionArray.badges.length].credits;

    await taskCompletionArray.save();
  } catch (err) {
    console.error("Error in awarding badges:", err);
  }
};
