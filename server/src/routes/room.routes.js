// src/routes/room.routes.js

import { Router } from 'express';
import {
  createRoom,
  getRoomById,
  discoverRooms,
  getMyRooms,
  updateRoom,
  deleteRoom,
  verifyRoomPassword,
  getRoomStats,
  searchRooms,
} from '../controllers/room.controller.js';

import { protect, locationRequired } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';

import {
  createRoomSchema,
  updateRoomSchema,
  joinRoomSchema,
  discoverRoomsSchema,
  roomIdParamSchema,
} from '../validators/room.validator.js';

const router = Router();

// All room routes require authentication
router.use(protect);

// ============== Room Discovery & Search ==============

// Discover nearby rooms (Geo-based)
router.get('/discover', validate(discoverRoomsSchema, 'query'), discoverRooms);

// Search rooms by name
router.get('/search', searchRooms);

// Get my created rooms
router.get('/my-rooms', getMyRooms);

// ============== Room CRUD ==============

// Create new room
router.post('/', validate(createRoomSchema), createRoom);

// Get room by ID
router.get('/:roomId', validate(roomIdParamSchema, 'params'), getRoomById);

// Update room
router.patch(
  '/:roomId',
  validate(roomIdParamSchema, 'params'),
  validate(updateRoomSchema),
  updateRoom
);

// Delete room
router.delete('/:roomId', validate(roomIdParamSchema, 'params'), deleteRoom);

// ============== Room Actions ==============

// Verify room password
router.post(
  '/:roomId/verify-password',
  validate(roomIdParamSchema, 'params'),
  validate(joinRoomSchema),
  verifyRoomPassword
);

// Get room stats
router.get('/:roomId/stats', validate(roomIdParamSchema, 'params'), getRoomStats);

export default router;
