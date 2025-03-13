const DBQuery = require("../model/model");
const asyncHandler = require("express-async-handler");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const { removeImage } = require("../middlewares/handleImage.middleware");

/* ======================================================================================================== */

/**
 * @desc    GET ALL PRODUCTS
 * @route   /api/products
 * @method  GET
 * @access  private
 */
module.exports.getAllProducts = asyncHandler(
  async (request, response, next) => {
    const search = "%" + (request.query.search || "") + "%";

    const { result: dataLength } = await DBQuery(
      "SELECT COUNT(id) AS dataLength FROM products WHERE title LIKE ? OR price LIKE ? OR created_at LIKE ? OR updated_at LIKE ?",
      [search, search, search, search]
    );

    const limit = +request.query.limit;
    const offset = (request.query.page - 1) * limit;

    let orderBy = "";
    if (request.query.orderBy) {
      orderBy = "ORDER BY " + request.query.orderBy + " DESC";
    }

    const imagesStatement = `GROUP_CONCAT("{", '"id": "', product_images.id, '", "product_id": "', product_images.product_id, '", "image": "', product_images.image, '" } ' ORDER BY product_images.id  SEPARATOR ', ' ) AS images`;
    const searchStatement = `AND (products.title LIKE ? OR products.description LIKE ? OR price LIKE ? OR products.created_at LIKE ? OR products.updated_at LIKE ?)`;

    const { result } = await DBQuery(
      `SELECT products.*, ${imagesStatement} FROM products LEFT JOIN product_images ON products.id = product_images.product_id WHERE products.status != "draft" ${searchStatement} GROUP BY products.id ${
        orderBy || ""
      } ${limit ? "LIMIT ? OFFSET ?" : ""}`,
      [search, search, search, search, search, limit, offset]
    );

    const products = result.map((product) => {
      if (product.images) {
        product.images = JSON.parse(`[${product.images}]`);
      }
      return product;
    });
    response.status(200).json({
      message: "get all products successfully",
      success: true,
      products,
      dataLength: dataLength[0].dataLength,
    });
  }
);

/* ======================================================================================================== */

/**
 * @desc    GET PRODUCT BY ID
 * @route   /api/products/:id
 * @method  GET
 * @access  private
 */
module.exports.getProductById = asyncHandler(
  async (request, response, next) => {
    const { result: product } = await DBQuery(
      "SELECT * FROM products WHERE id = ?",
      [request.params.id]
    );

    let { result: images } = await DBQuery(
      "SELECT * FROM product_images WHERE product_id = ?",
      [request.params.id]
    );

    const pathName = `${request.protocol}://${request.hostname}:${
      process.env.PORT || 4010
    }`;

    images = images.map((image) => {
      image.image = `${pathName}/products/${image.image}`;
      return image;
    });

    response.status(200).json({
      message: "get product successfully",
      success: true,
      product: { ...product[0], images },
    });
  }
);

/* ======================================================================================================== */

/**
 * @desc    CREATE NEW PRODUCT
 * @route   /api/products
 * @method  POST
 * @access  private
 */
module.exports.createNewProductWithImages = asyncHandler(
  async (request, response, next) => {
    let {
      category: category_id,
      title,
      description,
      rating = 0,
      ratings_number = 0,
      price,
      discount = 0,
      about,
      status = "publish",
      stock = 0,
    } = request.body;

    // CREATE NEW PRODUCT WITHOUT IMAGES
    const { result: createProduct } = await DBQuery(
      "INSERT INTO products (category_id, title, description, rating, ratings_number, price, discount, about, status, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        category_id,
        title,
        description,
        rating,
        ratings_number,
        price,
        discount,
        about,
        status,
        stock,
      ]
    );

    // GET ALL IMAGES NAME FROM MULTER
    const images = request.imageName
      .map((image) => `(${createProduct.insertId}, '${image}')`)
      .join(", ");

    // CREATE IMAGES IN PRODUCT_IMAGES TABLE;
    const { result: uploadImages } = await DBQuery(
      `INSERT INTO product_images (product_id, image) VALUES ${images}`
    );

    response.status(201).json({
      message: "created new product successfully",
      success: true,
      result: {
        createProduct,
        uploadImages,
      },
    });
  }
);

/* ======================================================================================================== */

/**
 * @desc    CREATE NEW PRODUCT
 * @route   /api/products
 * @method  POST
 * @access  private
 */
module.exports.createNewProductImagesFirst = asyncHandler(
  async (request, response, next) => {
    let {
      productID,
      category: category_id,
      title,
      description,
      rating = 0,
      ratings_number = 0,
      price,
      discount = 0,
      about,
      status = "draft",
      stock = 0,
    } = request.body;

    if (productID && category_id) {
      const { result } = await DBQuery(
        `UPDATE products SET title = ?, category_id = ?, description = ?, rating = ?, ratings_number = ?, price = ?, discount = ?, about = ?, status = ?, stock = ? WHERE id = ?`,
        [
          title,
          category_id,
          description,
          rating,
          ratings_number,
          price,
          discount,
          about,
          "publish",
          stock,
          productID,
        ]
      );
      return response.status(201).json({
        message: "created new product successfully",
        success: true,
        result,
      });
    } else if (category_id && !productID) {
      if (!category_id || category_id === "")
        return next(ApiErrorHandler("category id not found", 500));

      const { result } = await DBQuery(
        "INSERT INTO products (category_id) VALUES (?);",
        [category_id]
      );
      return response.status(201).json({
        id: result.insertId,
      });
    }

    // response.status(201).json({
    //   message: "created new product successfully",
    //   success: true,
    //   result: {
    //     createProduct,
    //     uploadImages,
    //   },
    // });
  }
);

/* ======================================================================================================== */

/**
 * @desc    UPDATE PRODUCT BY ID
 * @route   /api/products/:id
 * @method  PUT
 * @access  private
 */
module.exports.updateProductById = asyncHandler(
  async (request, response, next) => {
    if (!request.checkID)
      return next(new ApiErrorHandler("this product not found", 404));

    const productID = request.params.id;
    let {
      category_id,
      title,
      description,
      rating = 0,
      ratings_number = 0,
      price,
      discount = 0,
      about,
      status = "publish",
      stock,
    } = request.body;
    const { result } = await DBQuery(
      `UPDATE products SET title = ?, category_id = ?, description = ?, rating = ?, ratings_number = ?, price = ?, discount = ?, about = ?, status = ?, stock WHERE id = ?`,
      [
        title,
        category_id,
        description,
        rating,
        ratings_number,
        price,
        discount,
        about,
        status,
        stock,
        productID,
      ]
    );
    return response.status(201).json({
      message: "update product successfully",
      success: true,
      result,
    });
  }
);

/* ======================================================================================================== */

/**
 * @desc    DELETE PRODUCT BY ID
 * @route   /api/products/:id
 * @method  DELETE
 * @access  private
 */
module.exports.deleteProductById = asyncHandler(
  async (request, response, next) => {
    if (!request.checkID)
      return next(new ApiErrorHandler("this product not exists", 500));

    // GET ALL IMAGES FOR THIS PRODUCT BEFORE DELETED PRODUCT (BECAUSE WHEN PRODUCT DELETE IMAGES DELETED WITH IT)
    const { result: getProductImages } = await DBQuery(
      "SELECT image FROM product_images WHERE product_id = ?",
      [request.params.id]
    );
    // DELETE THIS PRODUCT
    const { result: deleteProduct } = await DBQuery(
      "DELETE FROM products WHERE id = ?",
      [request.params.id]
    );

    // DELETE IMAGES FROM FOLDER PRODUCTS
    getProductImages.forEach(async (image) => {
      await removeImage("products", image.image);
    });

    response.status(200).json({
      message: `deleted product and ${getProductImages.length} image/images for this product successfully`,
      success: true,
    });
  }
);

/* ======================================================================================================== */
