const router = require("express").Router();

const {
  getAllProducts,
  getProductById,
  createNewProductWithImages,
  createNewProductImagesFirst,
  updateProductById,
  deleteProductById,
} = require("../controllers/products.controller");
const { handleImage } = require("../middlewares/handleImage.middleware");

const { checkID } = require("../middlewares/checkIfExists.middleware");

const { onlyVerifyToken } = require("../middlewares/tokenHandle.middleware");

router.route("/").get(getAllProducts).post(
  onlyVerifyToken,
  handleImage("products").array("images", 20),

  createNewProductWithImages
);
router
  .route("/:id")
  .get(getProductById)
  .put(onlyVerifyToken, checkID("products"), updateProductById)
  .delete(onlyVerifyToken, checkID("products"), deleteProductById);

router.post(
  "/createImageBeforeProduct",
  onlyVerifyToken,
  createNewProductImagesFirst
);

module.exports = router;
