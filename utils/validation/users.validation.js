const joi = require("joi");
const ApiErrorHandler = require("../ApiErrorHandler");
const asyncHandler = require("express-async-handler");

module.exports.createUserValidation = asyncHandler(
  (request, response, next) => {
    const schema = joi.object({
      name: joi.string().trim().min(3).max(100).required(),
      email: joi.string().email().trim().min(5).max(250).required(),
      roles: joi.string().empty(""),
      password: joi.string().trim().min(8).max(250).required(),
      password_confirmed: joi
        .string()
        .trim()
        .min(8)
        .max(250)
        .required()
        .custom((value, helpers) => {
          if (request.body.password !== value) {
            return helpers.message(
              "Password must be matched with the password confirmed"
            );
          }
          return value;
        }),
    });

    const { error } = schema.validate(request.body);
    if (error) return next(new ApiErrorHandler(error.message, 401, error));
    next();
  }
);

module.exports.updateUserValidation = asyncHandler(
  (request, response, next) => {
    const schema = joi.object({
      name: joi.string().trim().min(3).max(100).required(),
      email: joi.string().email().trim().min(5).max(250).required(),
      roles: joi.string().trim().min(2).max(20).required(),
      //   password: joi.string().trim().min(8).max(250).required(),
      //   password_confirmed: joi
      //     .string()
      //     .trim()
      //     .min(8)
      //     .max(250)
      //     .required()
      //     .custom((value, helpers) => {
      //       if (request.body.password !== value) {
      //         return helpers.message(
      //           "Password must be matched with the password confirmed"
      //         );
      //       }
      //       return value;
      //     }),
    });

    const { error } = schema.validate(request.body);
    if (error) return next(new ApiErrorHandler(error.message, 401, error));
    next();
  }
);
