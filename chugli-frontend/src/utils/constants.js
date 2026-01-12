// src/utils/constants.js

export const APP_NAME = import.meta.env.VITE_APP_NAME || "Chugli";
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Room Constraints
export const ROOM_CONSTRAINTS = {
  MAX_ROOMS_PER_USER: 2,
  MIN_RADIUS_METERS: 500,
  MAX_RADIUS_METERS: 5000,
  DEFAULT_RADIUS_METERS: 1000,
  MAX_ROOM_NAME_LENGTH: 50,
  MIN_ROOM_NAME_LENGTH: 3,
};

// Radius Slider Marks
export const RADIUS_MARKS = [
  { value: 500, label: "500m" },
  { value: 1000, label: "1km" },
  { value: 2000, label: "2km" },
  { value: 3000, label: "3km" },
  { value: 5000, label: "5km" },
];

// Socket Events
export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  ROOM_JOINED: "room_joined",
  ROOM_LEFT: "room_left",
  ROOM_DELETED: "room_deleted",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  USERS_LIST: "users_list",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  ERROR: "error",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "chugli_access_token",
  REFRESH_TOKEN: "chugli_refresh_token",
  USER: "chugli_user",
  THEME: "chugli_theme",
  LAST_LOCATION: "chugli_last_location",
};

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  MY_ROOMS: "/my-rooms",
  CHAT: "/chat/:roomId",
  PROFILE: "/profile",
  SETTINGS: "/settings",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  UNAUTHORIZED: "Session expired. Please login again.",
  GENERIC: "Something went wrong. Please try again.",
  LOCATION_DENIED:
    "Location access denied. Please enable location to discover nearby rooms.",
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  SYSTEM: 'system',
  IMAGE: 'image',
  FILE: 'file',
};

// Message limits
export const MESSAGE_LIMITS = {
  MAX_LENGTH: 1000,
  MIN_LENGTH: 1,
};