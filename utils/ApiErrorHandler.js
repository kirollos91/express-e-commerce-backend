module.exports = class ApiErrorHandler extends Error {
  constructor(message, statusCode, originalError = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.name;
    this.cause = this.cause;
    this.stack = this.stack;
    this.originalError = originalError;
  }
};
