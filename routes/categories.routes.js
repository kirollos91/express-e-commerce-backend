const router = require("express").Router();

const {
  getAllCategories,
  getCategoryById,
  createNewCategory,
  updateCategoryById,
  deleteCategoryById,
} = require("../controllers/categories.controller");
const {
  createCategoryValidation,
  updateCategoryValidation,
} = require("../utils/validation/categories.validation");

const { onlyVerifyToken } = require("../middlewares/tokenHandle.middleware");

const { handleImage } = require("../middlewares/handleImage.middleware");
const { checkID } = require("../middlewares/checkIfExists.middleware");

router
  .route("/")
  .get(getAllCategories)
  .post(
    onlyVerifyToken,
    handleImage("categories").single("image"),
    createCategoryValidation,
    createNewCategory
  );
router
  .route("/:id")
  .get(checkID("categories"), getCategoryById)
  .put(
    onlyVerifyToken,
    checkID("categories"),
    handleImage("categories").single("image"),
    updateCategoryValidation,
    updateCategoryById
  )
  .delete(onlyVerifyToken, checkID("categories"), deleteCategoryById);

module.exports = router;
