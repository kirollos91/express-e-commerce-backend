const DB = require("../config/connection_with_mysql");
const ApiErrorHandler = require("../utils/ApiErrorHandler");

module.exports = (query, data = null) =>
  new Promise((resolve, reject) => {
    try {
      DB.query(query, data, (error, result, fields) => {
        if (error) reject(new ApiErrorHandler(error.message, 400, error));
        resolve({ result, fields });
      });
    } catch (error) {
      reject(new ApiErrorHandler(error.message, 400, error));
    }
  });
