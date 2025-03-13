const multer = require("multer");
const path = require("node:path");
const ApiErrorHandler = require("../utils/ApiErrorHandler");
const fs = require("node:fs");
const sharp = require("sharp");

let countImage = 0;

module.exports.resizesImage =
  (folderName) => async (request, response, next) => {
    try {
      if (request.files[0]) {
        await request.files.forEach(async (image, index) => {
          const imageName =
            folderName +
            "_" +
            (request.body.title || "title") +
            "_" +
            ++countImage +
            "_" +
            Date.now() +
            ".jpeg";
          // request.files[index].mimetype.split("/")[1];

          if (!request.imageName) request.imageName = [imageName];
          else request.imageName.push(imageName);

          sharp(request.files[index].buffer)
            .resize({
              fit: "fill",
              width: 400,
              height: 400,
            })
            .toFormat("jpeg")
            .jpeg({ quality: 95, force: true })
            .toFile(path.join(__dirname, "../images", folderName, imageName));
        });
      }
      next();
    } catch (error) {
      return new ApiErrorHandler(error.message, 500, error);
    }
  };

module.exports.handleImage = (folderName) => {
  try {
    const folderPath = path.join(__dirname, "../images", folderName);
    // const storage = multer.diskStorage({
    //   destination: function (request, file, cb) {
    //     cb(null, folderPath);
    //   },

    //   filename: function (request, file, cb) {
    //     const imageName =
    //       folderName +
    //       "_" +
    //       (request.body.title || "title") +
    //       "_" +
    //       ++countImage +
    //       "_" +
    //       Date.now() +
    //       "." +
    //       file.mimetype.split("/")[1];
    //     // new Date().getTime() + "." + file.originalname.split(".")[1];

    //     if (!request.imageName) request.imageName = [imageName];
    //     else request.imageName.push(imageName);

    //     if (!file.mimetype.startsWith("image"))
    //       return cb(new ApiErrorHandler("error with image", 400), imageName);

    //     cb(null, imageName);
    //   },
    // });

    return multer({ storage: multer.memoryStorage() });
  } catch (error) {
    return new ApiErrorHandler(error.message, 400, error);
  }
};

module.exports.removeImage = async (folderName, imageName) => {
  const folderPath = path.join(__dirname, "../images", folderName, imageName);
  fs.unlink(folderPath, (error) => {
    if (error) return new ApiErrorHandler(error.message, 400, error);
  });
};
