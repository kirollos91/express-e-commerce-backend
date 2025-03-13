const joi = require("joi");
const ApiErrorHandler = require("../ApiErrorHandler");

module.exports.createCategoryValidation = (request, response, next) => {
  const schema = joi.object({
    title: joi.string().min(3).max(255).trim().required(),
    image: joi.string().empty(""),
  });

  const { error } = schema.validate(request.body);

  if (error) return next(new ApiErrorHandler(error.message, 400, error));

  next();
};

module.exports.updateCategoryValidation = (request, response, next) => {
  const schema = joi.object({
    title: joi.string().min(3).max(255).trim().required(),
    image: joi.string().empty(""),
  });

  const { error } = schema.validate(request.body);
  if (error) return next(new ApiErrorHandler(error.message, 400, error));

  next();
};
