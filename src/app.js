const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const createError = require("http-errors");
const app = express();

// Load environment variables
dotenv.config();
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit

app.use(require("./middlewares/ratelimit"));

// Connect to PostgreSQL
require("./config/connect.db").initDatabase();

// Connect to Redis
require("./config/redis").initRedis();

// Import routes
app.use("/", require("./routers"));

// Error handler
app.use((req, res, next) => {
  next(createError(404, "Not Found"));
});

app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const response = {
    status: statusCode >= 400 && statusCode < 500 ? "fail" : "error",
    code: statusCode,
    message: err.message || "Internal Server Error",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack; // Include stack trace in development
  }

  res.status(statusCode).json(response);
});

module.exports = app;
