const DBQuery = require("../model/model");
const asyncHandler = require("express-async-handler");

/* ===================================================================================================================================== */

module.exports.emailExist = asyncHandler(async (request, response, next) => {
  const { result } = await DBQuery(
    "SELECT *,password, remember_token FROM users WHERE email = ?;",
    [request.body.email]
  );

  request.emailExist = result[0] ? true : false;
  request.userDataByEmail = result[0];
  next();
});

/* ===================================================================================================================================== */

module.exports.checkID = (table) =>
  asyncHandler(async (request, response, next) => {
    const { result } = await DBQuery(`SELECT * FROM ${table} WHERE id = ?;`, [
      request.params.id,
    ]);

    request.checkID = result[0] ? true : false;
    request.dataByID = result[0];
    next();
  });
