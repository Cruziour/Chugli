import ApiError from '../utils/ApiError.js';
import envConfig from '../config/env.config.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(envConfig.nodeEnv === 'development' && { stack: error.stack }),
  };

  // Log error in development
  if (envConfig.nodeEnv === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });
  }

  return res.status(error.statusCode).json(response);
};

// 404 Not Found Handler
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

export { errorHandler, notFoundHandler };
