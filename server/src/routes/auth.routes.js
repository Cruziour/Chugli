// src/routes/auth.routes.js

import { Router } from 'express';
import {
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
} from '../controllers/auth.controller.js';

import { protect } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter.middleware.js';

import {
  registerSchema,
  verifyOTPSchema,
  resendOTPSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateLocationSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

// ============== Public Routes ==============

// Registration & Verification
router.post('/register', authLimiter, validate(registerSchema), register);

router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), verifyOTP);

router.post('/resend-otp', otpLimiter, validate(resendOTPSchema), resendOTP);

// Login
router.post('/login', authLimiter, validate(loginSchema), login);

// Token Refresh
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

// Password Reset
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), forgotPassword);

router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

// ============== Protected Routes ==============

router.use(protect); // All routes below require authentication

router.post('/logout', logout);

router.get('/me', getMe);

router.patch('/location', validate(updateLocationSchema), updateLocation);

router.post('/change-password', validate(changePasswordSchema), changePassword);

router.delete('/account', deleteAccount);

export default router;
