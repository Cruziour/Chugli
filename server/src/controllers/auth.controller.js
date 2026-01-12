import User from '../models/user.model.js';
import tokenService from '../services/token.service.js';
import otpService from '../services/otp.service.js';
import emailService from '../services/email.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { COOKIE_OPTIONS } from '../utils/constants.js';

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, longitude, latitude } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    if (existingUser.email === email) {
      // If exists but not verified, allow re-registration
      if (!existingUser.isVerified) {
        await User.findByIdAndDelete(existingUser._id);
      } else {
        throw ApiError.conflict('Email already registered');
      }
    } else {
      throw ApiError.conflict('Username already taken');
    }
  }

  // Create location object if coordinates provided
  const location =
    longitude && latitude
      ? { type: 'Point', coordinates: [longitude, latitude] }
      : { type: 'Point', coordinates: [0, 0] };

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    location,
    isVerified: false,
  });

  // Generate OTP
  const otp = otpService.generateOTP(email, 'verify');

  // Send OTP email
  const emailResult = await emailService.sendOTPEmail(email, otp, username);

  if (!emailResult.success) {
    // Delete user if email fails
    await User.findByIdAndDelete(user._id);
    throw ApiError.internal('Failed to send verification email. Please try again.');
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
        message: `OTP sent to ${email}`,
        otpExpiry: otpService.getExpiryTime(),
      },
      'Registration successful. Please verify your email.'
    )
  );
});

/**
 * @desc    Verify OTP
 * @route   POST /api/v1/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isVerified) {
    throw ApiError.badRequest('Email already verified');
  }

  // Verify OTP
  const verification = otpService.verifyOTP(email, otp, 'verify');

  if (!verification.valid) {
    throw ApiError.badRequest(verification.message);
  }

  // Mark user as verified
  user.isVerified = true;
  user.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const tokens = tokenService.generateTokenPair(user);

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  // Send welcome email (don't await)
  emailService.sendWelcomeEmail(email, user.username).catch(console.error);

  // Set cookies
  res.cookie('accessToken', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.accessTokenExpiry,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.refreshTokenExpiry,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user.toPublicProfile(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Email verified successfully'
    )
  );
});

/**
 * @desc    Resend OTP
 * @route   POST /api/v1/auth/resend-otp
 * @access  Public
 */
export const resendOTP = asyncHandler(async (req, res) => {
  const { email, purpose = 'verify' } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (purpose === 'verify' && user.isVerified) {
    throw ApiError.badRequest('Email already verified');
  }

  // Generate new OTP
  const otp = otpService.generateOTP(email, purpose);

  // Send OTP
  let emailResult;
  if (purpose === 'reset') {
    emailResult = await emailService.sendPasswordResetEmail(email, otp, user.username);
  } else {
    emailResult = await emailService.sendOTPEmail(email, otp, user.username);
  }

  if (!emailResult.success) {
    throw ApiError.internal('Failed to send OTP. Please try again.');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        message: `OTP sent to ${email}`,
        otpExpiry: otpService.getExpiryTime(),
      },
      'OTP sent successfully'
    )
  );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findByEmailWithPassword(email);

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if verified
  if (!user.isVerified) {
    // Generate and send new OTP
    const otp = otpService.generateOTP(email, 'verify');
    await emailService.sendOTPEmail(email, otp, user.username);

    throw ApiError.forbidden('Email not verified. A new OTP has been sent to your email.');
  }

  // Update last activity
  user.lastActiveAt = new Date();

  // Generate tokens
  const tokens = tokenService.generateTokenPair(user);

  // Save refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.accessTokenExpiry,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.refreshTokenExpiry,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user.toPublicProfile(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Login successful'
    )
  );
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from body or cookies
  const incomingRefreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw ApiError.unauthorized('Refresh token required');
  }

  // Verify refresh token
  const decoded = tokenService.verifyRefreshToken(incomingRefreshToken);

  // Find user with refresh token
  const user = await User.findByRefreshToken(incomingRefreshToken);

  if (!user || user._id.toString() !== decoded._id) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // Generate new tokens
  const tokens = tokenService.generateTokenPair(user);

  // Update refresh token
  user.refreshToken = tokens.refreshToken;
  user.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.accessTokenExpiry,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.refreshTokenExpiry,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Token refreshed successfully'
    )
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from database
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

  // Clear cookies
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user.toPublicProfile(),
      },
      'User fetched successfully'
    )
  );
});

/**
 * @desc    Update location
 * @route   PATCH /api/v1/auth/location
 * @access  Private
 */
export const updateLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      lastActiveAt: new Date(),
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user.toPublicProfile(),
      },
      'Location updated successfully'
    )
  );
});

/**
 * @desc    Forgot password - Send OTP
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists or not
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          message: 'If the email exists, an OTP has been sent.',
        },
        'Password reset initiated'
      )
    );
  }

  // Generate OTP
  const otp = otpService.generateOTP(email, 'reset');

  // Send email
  await emailService.sendPasswordResetEmail(email, otp, user.username);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        message: 'If the email exists, an OTP has been sent.',
        otpExpiry: otpService.getExpiryTime(),
      },
      'Password reset initiated'
    )
  );
});

/**
 * @desc    Reset password with OTP
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Verify OTP
  const verification = otpService.verifyOTP(email, otp, 'reset');

  if (!verification.valid) {
    throw ApiError.badRequest(verification.message);
  }

  // Update password
  user.password = newPassword;
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, null, 'Password reset successful. Please login with your new password.')
    );
});

/**
 * @desc    Change password
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  user.refreshToken = undefined; // Invalidate all sessions
  await user.save();

  // Generate new tokens
  const tokens = tokenService.generateTokenPair(user);

  // Save new refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie('accessToken', tokens.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.accessTokenExpiry,
  });

  res.cookie('refreshToken', tokens.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.refreshTokenExpiry,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      'Password changed successfully'
    )
  );
});

/**
 * @desc    Delete account
 * @route   DELETE /api/v1/auth/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Password is incorrect');
  }

  // Delete user
  await User.findByIdAndDelete(req.user._id);

  // Clear cookies
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  res.status(200).json(new ApiResponse(200, null, 'Account deleted successfully'));
});

export default {
  register,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  logout,
  getMe,
  updateLocation,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
};
