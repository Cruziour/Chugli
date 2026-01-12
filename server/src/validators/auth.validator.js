import Joi from 'joi';
import { USER_CONSTRAINTS } from '../utils/constants.js';

// Custom messages
const messages = {
  'string.empty': '{#label} cannot be empty',
  'string.min': '{#label} must be at least {#limit} characters',
  'string.max': '{#label} cannot exceed {#limit} characters',
  'string.email': 'Please provide a valid email address',
  'any.required': '{#label} is required',
};

// Username regex: lowercase, numbers, underscore only
const usernameRegex = /^[a-z0-9_]+$/;

// Password regex: at least one letter and one number
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)/;

// ============== Validation Schemas ==============

export const registerSchema = Joi.object({
  username: Joi.string()
    .min(USER_CONSTRAINTS.MIN_USERNAME_LENGTH)
    .max(USER_CONSTRAINTS.MAX_USERNAME_LENGTH)
    .pattern(usernameRegex)
    .lowercase()
    .trim()
    .required()
    .messages({
      ...messages,
      'string.pattern.base':
        'Username can only contain lowercase letters, numbers, and underscores',
    }),

  email: Joi.string().email().lowercase().trim().required().messages(messages),

  password: Joi.string()
    .min(USER_CONSTRAINTS.MIN_PASSWORD_LENGTH)
    .max(USER_CONSTRAINTS.MAX_PASSWORD_LENGTH)
    .pattern(passwordRegex)
    .required()
    .messages({
      ...messages,
      'string.pattern.base': 'Password must contain at least one letter and one number',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      ...messages,
      'any.only': 'Passwords do not match',
    }),

  // Optional location during registration
  longitude: Joi.number().min(-180).max(180).optional().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
  }),

  latitude: Joi.number().min(-90).max(90).optional().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
  }),
}).with('longitude', 'latitude');

export const verifyOTPSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages(messages),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      ...messages,
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
    }),
});

export const resendOTPSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages(messages),

  purpose: Joi.string().valid('verify', 'reset').default('verify').messages({
    'any.only': 'Purpose must be either verify or reset',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages(messages),

  password: Joi.string().required().messages(messages),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional().messages(messages),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages(messages),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages(messages),

  otp: Joi.string()
    .length(6)
    .pattern(/^\d+$/)
    .required()
    .messages({
      ...messages,
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
    }),

  newPassword: Joi.string()
    .min(USER_CONSTRAINTS.MIN_PASSWORD_LENGTH)
    .max(USER_CONSTRAINTS.MAX_PASSWORD_LENGTH)
    .pattern(passwordRegex)
    .required()
    .messages({
      ...messages,
      'string.pattern.base': 'Password must contain at least one letter and one number',
    }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      ...messages,
      'any.only': 'Passwords do not match',
    }),
});

export const updateLocationSchema = Joi.object({
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      ...messages,
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
    }),

  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      ...messages,
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages(messages),

  newPassword: Joi.string()
    .min(USER_CONSTRAINTS.MIN_PASSWORD_LENGTH)
    .max(USER_CONSTRAINTS.MAX_PASSWORD_LENGTH)
    .pattern(passwordRegex)
    .required()
    .messages({
      ...messages,
      'string.pattern.base': 'Password must contain at least one letter and one number',
    }),

  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      ...messages,
      'any.only': 'Passwords do not match',
    }),
});

export default {
  registerSchema,
  verifyOTPSchema,
  resendOTPSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateLocationSchema,
  changePasswordSchema,
};
