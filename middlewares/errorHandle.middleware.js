const ApiErrorHandler = require("../utils/ApiErrorHandler");

module.exports.notFound = (request, response, next) => {
  next(
    new ApiErrorHandler(
      `Not found ${request.method}: ${request.originalUrl}`,
      404
    )
  );
};

module.exports.errorHandle = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  response.status(error.statusCode).json({
    message: error.message,
    code: error.statusCode,
    success: false,
    name: error.name !== "Error" ? error.name : undefined,
    cause: error.cause,
    stack: error.stack ? error.stack.split("\n    ") : error.stack,
    originError: error.originalError ? error.originalError : undefined,
  });
};
