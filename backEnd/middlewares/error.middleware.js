const {
  AppError,
  InternalServerError,
} = require("../utils/errors-classes.util");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(err instanceof AppError)) {
    error = new InternalServerError(err.message || "Something went wrong");
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || "error";

  //  Log error 
  console.error("ERROR 💥:", err);

  res.status(statusCode).json({
    success: false,
    status,
    message: error.message,
    // show stack only in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandler;