// src/socket/socket.auth.js

import User from '../models/user.model.js';
import tokenService from '../services/token.service.js';

/**
 * Socket.io Authentication Middleware
 * Verifies JWT token from handshake
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify token
    const decoded = tokenService.verifyAccessToken(token);

    // Find user
    const user = await User.findById(decoded._id);

    if (!user) {
      return next(new Error('User not found'));
    }

    if (!user.isVerified) {
      return next(new Error('Email not verified'));
    }

    // Attach user to socket
    socket.user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    // Update user's last activity
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication failed'));
  }
};

export default socketAuthMiddleware;
