const joi = require("joi");
const ApiErrorHandler = require("../ApiErrorHandler");

module.exports.createProductValidation = (request, response, next) => {
  const schema = joi.object().keys({
    category_id: joi.number().min(0).required(),
    title: joi.string().min(3).max(255).trim().required(),
    description: joi.string().min(3).max(255).trim().required(),
    price: joi.string().trim().required(),
    discount: joi.string().trim(),
    rating: joi.string().trim(),
    ratings_number: joi.string().trim(),
    about: joi.string().trim().min(3),
    status: joi.string().trim().min(3),
  });
  const { error } = schema.validate(request.body);
  if (error) return next(new ApiErrorHandler(error.message, 400, error));
  next();
};

module.exports.updateProductValidation = (request, response, next) => {
  const schema = joi.object().keys({
    category_id: joi.number().min(0),
    title: joi.string().min(3).max(255).trim(),
    description: joi.string().min(3).max(255).trim(),
    price: joi.string().trim(),
    discount: joi.string().trim(),
    rating: joi.string().trim(),
    ratings_number: joi.string().trim(),
    about: joi.string().trim().min(3),
    status: joi.string().trim().min(3),
  });
  const { error } = schema.validate(request.body);
  if (error) return next(new ApiErrorHandler(error.message, 400, error));
  next();
};
