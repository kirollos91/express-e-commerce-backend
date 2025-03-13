const DBQuery = require("../model/model");
const asyncHandler = require("express-async-handler");
const ApiErrorHandle = require("../utils/ApiErrorHandler");

module.exports.getAllCarts = asyncHandler(async (request, response, next) => {
  const { result: carts } = await DBQuery(
    `SELECT carts.*, products.title, products.description, products.discount, products.price ,  GROUP_CONCAT('{ "id": "', product_images.id, '",' , '"image": "', product_images.image , '"', '}' SEPARATOR ', ') AS images FROM carts LEFT JOIN products ON carts.product_id = products.id LEFT JOIN product_images ON product_images.product_id = products.id GROUP BY carts.id, products.id`
  );

  carts.map((cart) => {
    if (cart.images) {
      cart.images = JSON.parse(`[${cart.images}]`);
    }
    return cart;
  });

  response.status(200).json({
    message: "get All carts",
    success: true,
    carts: carts,
  });
});

module.exports.createCarts = asyncHandler(async (request, response, next) => {
  const { user_id, product_id, count } = request.body;

  const { result: product } = await DBQuery(
    "SELECT stock FROM products WHERE id = ?",
    [product_id]
  );

  if (+product[0]?.stock < count)
    return next(new ApiErrorHandle("stock Less than count", 404));

  if (!product[0]) return next(new ApiErrorHandle("Something Wrong", 500));

  await DBQuery("UPDATE products SET stock = ? WHERE id = ?", [
    +product[0].stock - count,
    product_id,
  ]);

  const { result: isExist } = await DBQuery(
    "SELECT product_id, count FROM carts WHERE product_id = ?",
    [product_id]
  );

  if (isExist[0]) {
    await DBQuery("UPDATE carts SET count = ? WHERE product_id = ?", [
      +isExist[0].count + count,
      product_id,
    ]);
    return response.status(201).json({
      message: "updated cart",
      success: true,
    });
  }

  const { result } = await DBQuery(
    "INSERT INTO carts (product_id, user_id, count) VALUES (?, ?, ?)",
    [product_id, user_id, count]
  );
  response.status(201).json({
    message: "create new cart",
    success: true,
    carts: result,
  });
});

module.exports.deleteCartsById = asyncHandler(
  async (request, response, next) => {
    const id = request.params.id;

    const { result: cart } = await DBQuery("SELECT * FROM carts WHERE id = ?", [
      id,
    ]);

    const { result: product } = await DBQuery(
      "SELECT * FROM products WHERE id = ?",
      [cart[0].product_id]
    );

    const { result: deleteCart } = await DBQuery(
      "DELETE FROM carts WHERE id = ?",
      [id]
    );
    if (deleteCart.affectedRows < 1)
      return next(new ApiErrorHandle("Something wrong", 500));

    const { result } = await DBQuery(
      "Update products SET stock = ? WHERE id = ?",
      [+product[0].stock + +cart[0].count, product[0].id]
    );

    response.status(200).json({
      message: "delete cart",
      success: true,
      carts: result,
    });
  }
);
