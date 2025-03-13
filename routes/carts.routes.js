const router = require("express").Router();

const {
  getAllCarts,
  createCarts,
  deleteCartsById,
} = require("../controllers/carts.controller");

router.route("/").get(getAllCarts).post(createCarts);
router.route("/:id").delete(deleteCartsById);

module.exports = router;
