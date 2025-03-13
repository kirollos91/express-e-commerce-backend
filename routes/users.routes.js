const router = require("express").Router();

const {
  getAllUser,
  getUserById,
  getUserByToken,
  createNewUser,
  updateUserById,
  deleteUserById,
} = require("../controllers/users.controller");

const {
  checkID,
  emailExist,
} = require("../middlewares/checkIfExists.middleware");

const {
  createUserValidation,
  updateUserValidation,
} = require("../utils/validation/users.validation");

const {
  onlyVerifyToken,
  isOnlyAdmin,
} = require("../middlewares/tokenHandle.middleware");

router
  .route("/")
  .get(onlyVerifyToken, isOnlyAdmin, getAllUser)
  .post(
    onlyVerifyToken,
    isOnlyAdmin,
    emailExist,
    createUserValidation,
    createNewUser
  );

router
  .route("/:id")
  .get(onlyVerifyToken, isOnlyAdmin, checkID("users"), getUserById)
  .put(
    onlyVerifyToken,
    isOnlyAdmin,
    checkID("users"),
    updateUserValidation,
    updateUserById
  )
  .delete(onlyVerifyToken, isOnlyAdmin, checkID("users"), deleteUserById);

router.get("/check/token", onlyVerifyToken, getUserByToken);

module.exports = router;
