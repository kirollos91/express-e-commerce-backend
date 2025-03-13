const DBQuery = require("../model/model");
const asyncHandler = require("express-async-handler");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const { removeImage } = require("../middlewares/handleImage.middleware");

/* ======================================================================================================== */

/**
 * @desc    GET ALL IMAGES
 * @route   /api/product_images/
 * @method  GET
 * @access  private
 */
module.exports.getAllImages = asyncHandler(
  async (request, response, next) => {}
);

/* ======================================================================================================== */

/**
 * @desc    GET IMAGE BY ID
 * @route   /api/product_images/:id
 * @method  GET
 * @access  private
 */
module.exports.getImageById = asyncHandler(
  async (request, response, next) => {}
);

/* ======================================================================================================== */

/**
 * @desc    GET PRODUCT IMAGES BY ID
 * @route   /api/product_images/product/:id
 * @method  GET
 * @access  private
 */
module.exports.getProductImagesById = asyncHandler(
  async (request, response, next) => {
    const { result } = await DBQuery(
      "SELECT image FROM product_images WHERE product_id = ?",
      [request.params.id]
    );
    response.status(200).json({
      message: "",
      success: true,
      images: result,
    });
  }
);

/* ======================================================================================================== */

/**
 * @desc    CREATE NEW IMAGES
 * @route   /api/product_images/
 * @method  POST
 * @access  private
 */
module.exports.createNewImages = asyncHandler(
  async (request, response, next) => {
    const queryImages = request.imageName.map((image, index) => {
      return `(${request.body.product_id}, '${image}')`;
    });
    const { result } = await DBQuery(
      `INSERT INTO product_images (product_id, image) VALUES ${queryImages.join(
        ", "
      )};`
    );

    let imageID = [
      {
        id: result.insertId,
        imageOrName: request.files[0].originalname,
        imageNewName: request.imageName[0],
      },
    ];
    for (let i = 1; i < queryImages.length; i++) {
      imageID.push({
        id: result.insertId + i,
        imageOrName: request.files[i].originalname,
        imageNewName: request.imageName[i],
      });
    }
    response.status(200).json({
      message: "created new images successfully",
      success: true,
      imageID,
    });
  }
);

/* ======================================================================================================== */

/**
 * @desc    UPDATE IMAGE BY ID
 * @route   /api/product_images/:id
 * @method  PUT
 * @access  private
 */
module.exports.updateImageById = asyncHandler(
  async (request, response, next) => {}
);

/* ======================================================================================================== */

/**
 * @desc    DELETE IMAGE BY ID
 * @route   /api/product_images/:id
 * @method  DELETE
 * @access  private
 */
module.exports.deleteImageById = asyncHandler(
  async (request, response, next) => {
    // if (!request.checkID)
    //   return next(new ApiErrorHandler("this image not exits", 500));

    const { result } = await DBQuery(
      "DELETE FROM product_images WHERE image = ? OR id = ?",
      [request.params.id, request.params.id]
    );

    if (request.checkID) await removeImage("products", request.dataByID.image);
    else if (!request.checkID) await removeImage("products", request.params.id);

    response.status(200).json({
      message: "",
      success: true,
    });
  }
);

/* ======================================================================================================== */
