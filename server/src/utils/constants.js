// src/utils/constants.js

export const ROOM_CONSTRAINTS = {
  MAX_ROOMS_PER_USER: 2,
  MIN_RADIUS_METERS: 500,
  MAX_RADIUS_METERS: 5000,
  DEFAULT_RADIUS_METERS: 1000,
  MAX_ROOM_NAME_LENGTH: 50,
  MIN_ROOM_NAME_LENGTH: 3,
};

export const USER_CONSTRAINTS = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
};

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Room events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  ROOM_DELETED: 'room_deleted',

  // Message events
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',

  // User events
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  USERS_LIST: 'users_list',

  // Typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',

  // Errors
  ERROR: 'error',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export default {
  ROOM_CONSTRAINTS,
  USER_CONSTRAINTS,
  OTP_CONFIG,
  SOCKET_EVENTS,
  HTTP_STATUS,
  COOKIE_OPTIONS,
};
