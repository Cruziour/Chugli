import User from '../models/user.model.js';
import tokenService from '../services/token.service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Protect routes - Verify access token
 */
export const protect = asyncHandler(async (req, res, next) => {
  // 1. Get token from header or cookies
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access token required. Please login.');
  }

  // 2. Verify token
  const decoded = tokenService.verifyAccessToken(token);

  // 3. Check if user still exists
  const user = await User.findById(decoded._id);

  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  // 4. Check if user is verified
  if (!user.isVerified) {
    throw ApiError.forbidden('Please verify your email first');
  }

  // 5. Update last activity
  user.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });

  // 6. Attach user to request
  req.user = user;
  next();
});

/**
 * Optional auth - Don't throw error if no token
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(); // No token, continue without user
  }

  try {
    const decoded = tokenService.verifyAccessToken(token);
    const user = await User.findById(decoded._id);

    if (user && user.isVerified) {
      req.user = user;
    }
  } catch (error) {
    // Token invalid, continue without user
  }

  next();
});

/**
 * Restrict to verified users only
 */
export const verifiedOnly = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (!req.user.isVerified) {
    throw ApiError.forbidden('Email verification required');
  }

  next();
});

/**
 * Check if user has set location
 */
export const locationRequired = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  const { coordinates } = req.user.location || {};

  if (!coordinates || (coordinates[0] === 0 && coordinates[1] === 0)) {
    throw ApiError.badRequest('Please update your location to access this feature');
  }

  next();
});

export default {
  protect,
  optionalAuth,
  verifiedOnly,
  locationRequired,
};
