const router = require("express").Router();

const {
  createNewImages,
  getProductImagesById,
  deleteImageById,
} = require("../controllers/product.images.controller");
const { checkID } = require("../middlewares/checkIfExists.middleware");
const {
  handleImage,
  resizesImage,
} = require("../middlewares/handleImage.middleware");

router
  .route("/")
  .post(
    handleImage("products").array("images", 20),
    resizesImage("products"),
    createNewImages
  );

router
  .route("/:id")
  .get()
  .put()
  .delete(checkID("product_images"), deleteImageById);
router;
router
  .route("/product/:id")
  .get(checkID("product_images"), getProductImagesById);
module.exports = router;
