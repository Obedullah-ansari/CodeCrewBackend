// swaggerui.js
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0", // Swagger version
    info: {
      title: "CodeCrew API Documentation",
      version: "1.0.0",
      description: "A simple API built with Express",
    },
    servers: [
      {
        url: "http://localhost:4000", // Replace with your server's base URL
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your route files for Swagger annotations
};

const swaggerSpecs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpecs;
