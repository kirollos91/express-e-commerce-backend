const router = require("express").Router();
const {
  registerValidation,
  loginValidation,
} = require("../utils/validation/auth.validation");
const {
  register,
  login,
  getGoogle,
  getGoogleCallback,
} = require("../controllers/auth.controller");
const { emailExist } = require("../middlewares/checkIfExists.middleware");
const {
  revokeToken,
  refreshToken,
} = require("../middlewares/tokenHandle.middleware");

router.post("/register", registerValidation, emailExist, register);
router.post("/login", loginValidation, emailExist, login);

router.get("/google", getGoogle);
router.get("/google/callback", getGoogleCallback);

router.get("/logout", revokeToken);
router.get("/refresh_token", refreshToken);

module.exports = router;
