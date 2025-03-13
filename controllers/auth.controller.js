const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const DBQuery = require("../model/model");
const { generateToken } = require("../middlewares/tokenHandle.middleware");
const axios = require("axios");

/* ===================================================================================================================================== */

/**
 * @desc    USER REGISTER
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 */
module.exports.register = asyncHandler(async (request, response, next) => {
  if (request.emailExist)
    return next(new ApiErrorHandler("This email already exists", 401));
  let { name, email, password, roles } = request.body;

  roles = roles ? roles : "2001";
  email = email.toLowerCase();
  password = await bcrypt.hash(password, 10);

  const token = generateToken({ name, email, roles });

  await DBQuery(
    "INSERT INTO users (name, email, password, remember_token) VALUES (?, ?, ?, ?);",
    [name, email, password, token]
  );

  response.status(201).json({
    message: "created a new user successfully",
    success: true,
    user: {
      email,
      name,
    },
    token,
  });
});

/* ===================================================================================================================================== */

/**
 * @desc    USER LOGIN
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 */
module.exports.login = asyncHandler(async (request, response, next) => {
  if (!request.emailExist)
    return next(new ApiErrorHandler("Invalid email or password"), 404);

  let { password } = request.body;

  const checkPassword = await bcrypt.compare(
    password,
    request.userDataByEmail.password
  );
  if (!checkPassword)
    return next(new ApiErrorHandler("Invalid email or password"), 404);

  let { email, name, roles } = request.userDataByEmail;

  const token = generateToken({ name, email, roles });

  await DBQuery("UPDATE users SET remember_token = ? WHERE email = ?", [
    token,
    email,
  ]);

  response.status(200).json({
    message: "login user successfully",
    success: true,
    user: {
      email,
      name,
      roles,
    },
    token: token,
  });
});

/* ===================================================================================================================================== */

module.exports.getGoogle = asyncHandler((request, response) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&response_type=code&scope=profile email`;
  response.redirect(url);
});

/* ===================================================================================================================================== */

module.exports.getGoogleCallback = asyncHandler(
  async (request, response, next) => {
    const { code } = request.query;

    try {
      // Exchange authorization code for access token
      const { data } = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET_KEY,
        code,
        redirect_uri: process.env.REDIRECT_URL,
        grant_type: "authorization_code",
      });

      const { access_token, id_token } = data;
      // Use access_token or id_token to fetch user profile
      const { data: profile } = await axios.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const token = generateToken({ name: profile.name, email: profile.email });

      const { result } = await DBQuery(
        "SELECT id,email FROM users WHERE email = ?",
        [profile.email]
      );
      let id = 0;
      if (!result[0]) {
        const { result } = await DBQuery(
          "INSERT INTO users (name, email, google_id, google_token, remember_token) VALUES (?, ?, ?, ?, ?)",
          [profile.name, profile.email, profile.id, access_token, token]
        );
        id = result.insertId;
      } else if (result[0]) {
        await DBQuery(
          "UPDATE users SET google_id = ?, google_token = ?, remember_token = ? WHERE email = ?",
          [profile.id, access_token, token, profile.email]
        );
        id = result[0].id;
      }

      // response.cookie("e-commerce", token);

      response.status(200).json({
        user: { ...profile, userID: id },
        token,
      });
      // response.redirect("http://localhost:3000/users");
      // Code to handle user authentication and retrieval using the profile data
    } catch (error) {
      return next(new ApiErrorHandler(error.message, 401, error));
    }
  }
);
