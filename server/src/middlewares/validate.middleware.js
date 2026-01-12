import ApiError from '../utils/ApiError.js';

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Request property to validate (body, query, params)
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Get all errors
      stripUnknown: true, // Remove unknown fields
      convert: true, // Type coercion
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      const errorMessage = errorMessages.map((e) => e.message).join(', ');

      throw ApiError.badRequest(errorMessage, errorMessages);
    }

    // Replace request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

export default validate;
