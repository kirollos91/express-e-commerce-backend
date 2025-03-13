const DBQuery = require("../model/model");
const asyncHandler = require("express-async-handler");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const { removeImage } = require("../middlewares/handleImage.middleware");
/* ===================================================================================================================================== */

/**
 * @desc    GET ALL CATEGORIES
 * @route   /api/categories
 * @method  GET
 * @access  public
 */

module.exports.getAllCategories = asyncHandler(
  async (request, response, next) => {
    const search = "%" + (request.query.search || "") + "%";

    const { result: dataLength } = await DBQuery(
      "SELECT COUNT(id) AS dataLength FROM categories WHERE title LIKE ? OR created_at LIKE ? OR updated_at LIKE ?",
      [search, search, search]
    );

    const limit = +request.query.limit;
    const offset = (request.query.page - 1) * limit;

    let orderBy = "";
    if (request.query.orderBy) {
      orderBy = "ORDER BY " + request.query.orderBy + " DESC";
    }

    const { result } = await DBQuery(
      `SELECT * FROM categories WHERE title LIKE ? OR created_at LIKE ? OR updated_at LIKE ? ${
        orderBy || ""
      } ${limit ? "LIMIT ? OFFSET ?" : ""}`,
      [search, search, search, limit, offset]
    );

    const pathName = `${request.protocol}://${request.hostname}:${
      process.env.PORT || 4010
    }`;
    const categories = result.map((category) => {
      if (category.image)
        category.image = `${pathName}/categories/${category.image}`;

      return category;
    });

    response.status(200).json({
      message: "get all categories",
      success: true,
      dataLength: dataLength[0].dataLength,
      categories,
    });
  }
);

/* ===================================================================================================================================== */

/**
 * @desc    GET CATEGORY BY ID
 * @route   /api/categories/:id
 * @method  GET
 * @access  public
 */

module.exports.getCategoryById = asyncHandler(
  async (request, response, next) => {
    if (!request.checkID)
      return next(new ApiErrorHandler("this category not exists"));
    let { title, image } = request.dataByID;

    // Check if image is default image
    image = image.includes("default_image")
      ? `${request.protocol}://${request.hostname}:${
          process.env.PORT || 4010
        }/${image}`
      : `${request.protocol}://${request.hostname}:${
          process.env.PORT || 4010
        }/categories/${image}`;

    response.status(200).json({
      message: `get category ${title} data successfully`,
      success: true,
      category: {
        title,
        image,
      },
    });
  }
);

/* ===================================================================================================================================== */

/**
 * @desc    CREATE NEW CATEGORY
 * @route   /api/categories
 * @method  POST
 * @access  public
 */

module.exports.createNewCategory = asyncHandler(
  async (request, response, next) => {
    const { title } = request.body;
    const imageName = request.imageName || "default_image.jpg";

    const { result } = await DBQuery(
      `INSERT INTO categories (title, image) VALUES (?, ?);`,
      [title, imageName]
    );

    response.status(201).json({
      message: "created new category successfully",
      success: true,
      category: { title, image: imageName, id: result.insertId },
    });
  }
);

/* ===================================================================================================================================== */

/**
 * @desc    UPDATE CATEGORY BY ID
 * @route   /api/categories/:id
 * @method  PUT
 * @access  public
 */

module.exports.updateCategoryById = asyncHandler(
  async (request, response, next) => {
    if (!request.checkID)
      return next(new ApiErrorHandler("this category not exists"));

    const { image, id } = request.dataByID;
    const { title } = request.body;

    const imageName = request.imageName || image;

    await DBQuery(
      `UPDATE categories SET ${title ? "title = '" + title + "', " : ""}${
        imageName ? "image = '" + imageName + "'" : ""
      } WHERE id = ?`,
      [request.params.id]
    );
    if (request.imageName) await removeImage("categories", image);

    response.status(200).json({
      message: "updated category successfully",
      success: true,
      category: { title, image: imageName, id },
    });
  }
);

/* ===================================================================================================================================== */

/**
 * @desc    DELETE CATEGORY BY ID
 * @route   /api/categories/:id
 * @method  DELETE
 * @access  public
 */

module.exports.deleteCategoryById = asyncHandler(
  async (request, response, next) => {
    if (!request.checkID)
      return next(new ApiErrorHandler("this category not exists"));

    const { image, title } = request.dataByID;

    await DBQuery("DELETE FROM categories WHERE id = ?;", [request.params.id]);
    await removeImage("categories", image);

    response.status(200).json({
      message: "deleted category successfully",
      success: true,
      category: title,
    });
  }
);
