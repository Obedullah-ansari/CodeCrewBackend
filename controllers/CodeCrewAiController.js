const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const catchAsync = require("../utils/catchAsync");
dotenv.config({ path: "../.env" });
const AppError = require("../utils/appError");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.CodeCrewAi = catchAsync(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return next(new AppError("Prompt is required"));
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const generatedText =  result.response.text();
  

  res.status(200).json({ response: generatedText });
});
