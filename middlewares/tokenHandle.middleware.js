const jwt = require("jsonwebtoken");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const DBQuery = require("../model/model");

/* ===================================================================================================================================== */

module.exports.generateToken = (data, expiresIn = "100d") => {
  return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn });
};

/* ===================================================================================================================================== */

async function verifyToken(request) {
  try {
    let { authorization } = request.headers;
    if (!authorization) return { error: { message: "Invalid token" } };

    authorization = authorization.split(" ");
    // check if first word is Bearer
    if (!authorization[0] === "Bearer")
      return { error: { message: "Invalid token" } };

    // Search for token if exists or not in database
    const { result } = await DBQuery(
      "SELECT remember_token FROM users WHERE remember_token = ?",
      [authorization[1]]
    );
    // check if token was exists in database
    if (!result[0]) return { error: { message: "Invalid token" } };

    // check if token is correct and valid
    const getVerifyToken = jwt.verify(
      authorization[1],
      process.env.JWT_SECRET_KEY
    );
    if (!getVerifyToken) return { error: { message: "Invalid token" } };

    return { getVerifyToken, error: undefined };
  } catch (error) {
    return { error };
  }
}

/* ===================================================================================================================================== */

module.exports.onlyVerifyToken = async (request, response, next) => {
  try {
    const { getVerifyToken, error } = await verifyToken(request);

    if (error) return next(new ApiErrorHandler(error.message, 401, error));

    request.getVerifyToken = getVerifyToken;
    next();
  } catch (error) {
    return next(new ApiErrorHandler(error.message, 401, error));
  }
};

/* ===================================================================================================================================== */

module.exports.isOnlyAdmin = async (request, response, next) => {
  try {
    const { getVerifyToken, error } = await verifyToken(request);
    if (error) return next(new ApiErrorHandler(error.message, 401, error));

    const { roles } = getVerifyToken;
    if (roles !== "Admin")
      return next(new ApiErrorHandler("Forbidden user", 403));

    next();
  } catch (error) {
    return next(new ApiErrorHandler(error.message, 403, error));
  }
};

/* ===================================================================================================================================== */

module.exports.isAdminOrUser = async (request, response, next) => {
  try {
    const { getVerifyToken, error } = await verifyToken(request);
    if (error) return next(new ApiErrorHandler(error.message, 401, error));

    const { roles } = getVerifyToken;
    if (roles !== "Admin" && roles !== "Writer")
      return next(new ApiErrorHandler("Forbidden user", 403));

    next();
  } catch (error) {
    return next(new ApiErrorHandler(error.message, 403, error));
  }
};

/* ===================================================================================================================================== */

module.exports.refreshToken = async (request, response, next) => {
  try {
    const { error, getVerifyToken } = await verifyToken(request);
    if (error) return next(new ApiErrorHandler(error.message, 401, error));
    const token = generateToken({
      name: getVerifyToken.name,
      email: getVerifyToken.email,
      roles: getVerifyToken.roles,
    });
    await DBQuery("UPDATE users SET remember_token = ? WHERE email = ?", [
      token,
      getVerifyToken.email,
    ]);
    // next();
  } catch (error) {
    return next(new ApiErrorHandler(error.message, 401, error));
  }
};

/* ===================================================================================================================================== */

module.exports.revokeToken = async (request, response, next) => {
  try {
    const { error, getVerifyToken } = await verifyToken(request);
    if (error) return next(new ApiErrorHandler(error.message, 401, error));

    await DBQuery(
      "UPDATE users SET remember_token = ?, google_token = ? WHERE email = ?",
      [null, null, getVerifyToken.email]
    );

    response.status(200).json({
      message: "logged out successfully",
      success: true,
    });
  } catch (error) {
    return next(new ApiErrorHandler(error.message, 401, error));
  }
};
