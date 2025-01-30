const express = require("express");
const app = express();
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./utils/swaggerui");
const appError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const authRoutes = require("./routes/authRoutes");
const projectInfoRoutes = require("./routes/projectsInfoRoutes");
const problemRoutes = require("./routes/problemStatementRoutes");
const codeSolutionRoutes = require("./routes/codeSolutionsRoutes");
const userCodeRoutes = require("./routes/userCodeRoutes");
const initialCodeRoutes = require("./routes/initialCodeRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const uploadRoutes = require("./routes/uploadsRoutes");
const badgesRoutes = require("./routes/badgesRoutes")
const aiRoutes = require ("./routes/aiRoutes")
const path = require("path");
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000","https://code-crew-frontend-n4uc.vercel.app" ,"https://code-crew-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Define allowed methods
    credentials: true, // If you're sending cookies or HTTP authentication
    optionsSuccessStatus: 200, // Response status for preflight requests
  })
);
app.options("*", cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  "/badgesUploads",
  express.static(path.join(__dirname, "badgesUploads"))
);
app.use(
  "/problemStatementsUploads",
  express.static(path.join(__dirname, "problemStatementsUploads"))
);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectInfoRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/solutions", codeSolutionRoutes, initialCodeRoutes);
app.use("/api/v1/usercode", userCodeRoutes);
app.use("/api/v1/userperformace", performanceRoutes);
app.use("/api/v1/images", uploadRoutes);
app.use("/api/v1/badges", badgesRoutes);
app.use("/api/v1/gemeni", aiRoutes);

app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
