import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many requests, please try again later'));
  },
});

// Strict limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Too many authentication attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many authentication attempts'));
  },
});

// OTP request limiter
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 OTP requests per 10 minutes
  message: 'Too many OTP requests, please try again after 10 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many OTP requests'));
  },
});

export default { apiLimiter, authLimiter, otpLimiter };
