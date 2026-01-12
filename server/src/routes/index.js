// src/routes/index.js (UPDATED)

import { Router } from 'express';
import authRoutes from './auth.routes.js';
import roomRoutes from './room.routes.js';

const router = Router();

// API Info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Welcome to Chugli API v1',
    version: '1.0.0',
    description: 'Hyper-local messaging hub - Privacy first, zero data footprint',
    endpoints: {
      auth: {
        base: '/api/v1/auth',
        routes: {
          register: 'POST /register',
          verifyOTP: 'POST /verify-otp',
          resendOTP: 'POST /resend-otp',
          login: 'POST /login',
          refreshToken: 'POST /refresh-token',
          logout: 'POST /logout',
          me: 'GET /me',
          updateLocation: 'PATCH /location',
          forgotPassword: 'POST /forgot-password',
          resetPassword: 'POST /reset-password',
          changePassword: 'POST /change-password',
          deleteAccount: 'DELETE /account',
        },
      },
      rooms: {
        base: '/api/v1/rooms',
        routes: {
          create: 'POST /',
          discover: 'GET /discover?longitude=X&latitude=Y&radius=Z',
          search: 'GET /search?q=query',
          myRooms: 'GET /my-rooms',
          getById: 'GET /:roomId',
          update: 'PATCH /:roomId',
          delete: 'DELETE /:roomId',
          verifyPassword: 'POST /:roomId/verify-password',
          stats: 'GET /:roomId/stats',
        },
      },
      socket: {
        events: {
          join_room: 'Join a chat room',
          leave_room: 'Leave current room',
          send_message: 'Send message (not stored)',
          receive_message: 'Receive messages',
          user_joined: 'User joined notification',
          user_left: 'User left notification',
          typing_start: 'Typing indicator start',
          typing_stop: 'Typing indicator stop',
          room_deleted: 'Room deletion notification',
        },
      },
    },
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Room routes
router.use('/rooms', roomRoutes);

export default router;
