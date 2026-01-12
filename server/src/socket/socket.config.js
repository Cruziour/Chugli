// src/socket/socket.config.js

import { Server } from 'socket.io';
import envConfig from '../config/env.config.js';

/**
 * Configure Socket.io server
 */
export const configureSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [envConfig.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  return io;
};

export default configureSocketIO;
