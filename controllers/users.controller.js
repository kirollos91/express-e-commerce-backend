const DBQuery = require("../model/model");
const asyncHandler = require("express-async-handler");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const { generateToken } = require("../middlewares/tokenHandle.middleware");
const bcrypt = require("bcryptjs");

/* ===================================================================================================================================== */

/**
 * @desc    GET ALL USERS
 * @route   /api/users
 * @method  GET
 * @access  private
 */
module.exports.getAllUser = asyncHandler(async (request, response, next) => {
  const limit = +request.query.limit;
  const offset = (request.query.page - 1) * limit || 0;
  const search = "%" + (request.query.search || "") + "%";

  const { result: dataLength } = await DBQuery(
    "SELECT COUNT(id) AS dataLength FROM users WHERE name LIKE ? OR email LIKE ? OR created_at LIKE ? OR updated_at LIKE ?",
    [search, search, search, search]
  );

  const { email } = request.getVerifyToken;
  const { result: users } = await DBQuery(
    `SELECT id, name, email, IF(email= ?, true, false) AS is_active , roles, updated_at, created_at FROM users WHERE name LIKE ? OR email LIKE ? OR created_at LIKE ? OR updated_at LIKE ? ${
      limit ? "LIMIT ? OFFSET ?" : ""
    };`,
    [email, search, search, search, search, limit, offset]
  );

  response.status(200).json({
    message: "get all users successfully",
    success: true,
    usersCount: users.length,
    users,
    dataLength: dataLength[0].dataLength,
  });
});

/* ===================================================================================================================================== */

/**
 * @desc    GET USER BY ID
 * @route   /api/users/:id
 * @method  GET
 * @access  private
 */
module.exports.getUserById = asyncHandler(async (request, response, next) => {
  if (!request.checkID)
    return next(new ApiErrorHandler("this user is not exists"), 404);

  let { name, ...result } = request.dataByID;

  response.status(200).json({
    message: `get users ${name} successfully`,
    success: true,
    user: { name, ...result },
  });
});

/* ===================================================================================================================================== */

/**
 * @desc    GET USER BY TOKEN
 * @route   /api/users/check/token
 * @method  GET
 * @access  private
 */
module.exports.getUserByToken = asyncHandler(
  async (request, response, next) => {
    const { email } = request.getVerifyToken;

    const { result } = await DBQuery(
      "SELECT id, name, email, roles FROM users WHERE email = ?",
      [email]
    );
    let { id, name, email: userEmail, roles } = result[0];

    response.status(200).json({
      message: `get data user ${name} successfully`,
      success: true,
      user: { id, name, email: userEmail, roles },
    });
  }
);

/* ===================================================================================================================================== */

/**
 * @desc    CREATE NEW USER
 * @route   /api/users
 * @method  POST
 * @access  private
 */
module.exports.createNewUser = asyncHandler(async (request, response, next) => {
  if (request.emailExist)
    return next(new ApiErrorHandler("this email already exists", 401));
  let { name, email, password, roles } = request.body;
  const roleName = roles ? roles : "User";

  password = await bcrypt.hash(password, 10);

  email = email.toLowerCase();

  const token = generateToken({ name, email, roles });

  const { result } = await DBQuery(
    "INSERT INTO users (name, email, password, remember_token, roles) VALUES (?, ?, ?, ?, ?)",
    [name, email, password, token, roles]
  );

  response.status(201).json({
    message: `create new user successfully`,
    success: true,
    user: { name, email, roles: roleName, id: result.insertId },
    token,
  });
});

/* ===================================================================================================================================== */

/**
 * @desc    UPDATE USER BY ID
 * @route   /api/users/:id
 * @method  PUT
 * @access  private
 */
module.exports.updateUserById = asyncHandler(
  async (request, response, next) => {
    if (!request.checkID)
      return next(new ApiErrorHandler("this user is not exists"), 404);

    const {
      name: originalName,
      email: originalEmail,
      password,
      remember_token,
      google_token,
      roles: originalRoles,
      ...userData
    } = request.dataByID;
    let { name, email, roles } = request.body;

    if (!name && !email && !roles)
      return next(
        new ApiErrorHandler(
          "you are not change any thing updated is failed",
          400
        )
      );

    name = name ? name : originalName;
    email = email ? email.toLowerCase() : originalEmail;
    roles = roles ? roles : originalRoles;

    const token = generateToken({ name, email, roles });

    await DBQuery(
      `UPDATE users SET name = ?, email = ?, roles = ?, remember_token = ? WHERE id = ?`,
      [name, email, roles, token, request.params.id]
    );

    response.status(200).json({
      message: `updated user ${name} successfully`,
      success: true,
      user: { name, email, roles, ...userData },
      token,
    });
  }
);

/* ===================================================================================================================================== */

/**
 * @desc    DELETE USER BY ID
 * @route   /api/users/:id
 * @method  DELETE
 * @access  private
 */
module.exports.deleteUserById = asyncHandler(
  async (request, response, next) => {
    if (!request.checkID)
      return next(new ApiErrorHandler("this user is not exists"), 404);

    const { name } = request.dataByID;

    await DBQuery("DELETE FROM users WHERE id = ?", [request.params.id]);

    response.status(200).json({
      message: `deleted user ${name} successfully`,
      success: true,
    });
  }
);
