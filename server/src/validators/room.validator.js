// src/validators/room.validator.js

import Joi from 'joi';
import { ROOM_CONSTRAINTS } from '../utils/constants.js';

// Custom messages
const messages = {
  'string.empty': '{#label} cannot be empty',
  'string.min': '{#label} must be at least {#limit} characters',
  'string.max': '{#label} cannot exceed {#limit} characters',
  'number.min': '{#label} must be at least {#limit}',
  'number.max': '{#label} cannot exceed {#limit}',
  'any.required': '{#label} is required',
};

// Room name regex: alphanumeric, spaces, hyphens, underscores
const roomNameRegex = /^[a-zA-Z0-9\s\-_]+$/;

// ============== Validation Schemas ==============

export const createRoomSchema = Joi.object({
  name: Joi.string()
    .min(ROOM_CONSTRAINTS.MIN_ROOM_NAME_LENGTH)
    .max(ROOM_CONSTRAINTS.MAX_ROOM_NAME_LENGTH)
    .pattern(roomNameRegex)
    .trim()
    .required()
    .messages({
      ...messages,
      'string.pattern.base':
        'Room name can only contain letters, numbers, spaces, hyphens, and underscores',
    }),

  description: Joi.string().max(200).trim().optional().allow('').messages(messages),

  isPrivate: Joi.boolean().default(false),

  password: Joi.when('isPrivate', {
    is: true,
    then: Joi.string()
      .min(4)
      .max(20)
      .required()
      .messages({
        ...messages,
        'any.required': 'Password is required for private rooms',
      }),
    otherwise: Joi.forbidden(),
  }),

  tags: Joi.array().items(Joi.string().max(20).trim()).max(5).optional().default([]).messages({
    'array.max': 'Maximum 5 tags allowed',
  }),

  // Location is taken from user's current location
  longitude: Joi.number().min(-180).max(180).optional().messages(messages),

  latitude: Joi.number().min(-90).max(90).optional().messages(messages),
}).with('longitude', 'latitude');

export const updateRoomSchema = Joi.object({
  description: Joi.string().max(200).trim().optional().allow('').messages(messages),

  tags: Joi.array().items(Joi.string().max(20).trim()).max(5).optional().messages({
    'array.max': 'Maximum 5 tags allowed',
  }),
});

export const joinRoomSchema = Joi.object({
  password: Joi.string().optional().allow('').messages(messages),
});

export const discoverRoomsSchema = Joi.object({
  longitude: Joi.number().min(-180).max(180).required().messages(messages),

  latitude: Joi.number().min(-90).max(90).required().messages(messages),

  radius: Joi.number()
    .min(ROOM_CONSTRAINTS.MIN_RADIUS_METERS)
    .max(ROOM_CONSTRAINTS.MAX_RADIUS_METERS)
    .default(ROOM_CONSTRAINTS.DEFAULT_RADIUS_METERS)
    .messages({
      'number.min': `Radius must be at least ${ROOM_CONSTRAINTS.MIN_RADIUS_METERS} meters`,
      'number.max': `Radius cannot exceed ${ROOM_CONSTRAINTS.MAX_RADIUS_METERS} meters`,
    }),

  page: Joi.number().min(1).default(1).messages(messages),

  limit: Joi.number().min(1).max(50).default(20).messages(messages),

  excludePrivate: Joi.boolean().default(false),
});

export const roomIdParamSchema = Joi.object({
  roomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      ...messages,
      'string.pattern.base': 'Invalid room ID format',
    }),
});

export default {
  createRoomSchema,
  updateRoomSchema,
  joinRoomSchema,
  discoverRoomsSchema,
  roomIdParamSchema,
};
