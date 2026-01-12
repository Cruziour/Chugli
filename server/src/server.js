// src/server.js (FINAL VERSION)

import { createServer } from 'http';
import app from './app.js';
import connectDB from './config/db.config.js';
import envConfig from './config/env.config.js';
import emailService from './services/email.service.js';
import ghostScheduler from './schedulers/ghost.scheduler.js';
import configureSocketIO from './socket/socket.config.js';
import socketAuthMiddleware from './socket/socket.auth.js';
import { setupRoomSocket, getSocketStats } from './socket/room.socket.js';

const PORT = envConfig.port;

// Create HTTP server
const httpServer = createServer(app);

// Configure Socket.io
const io = configureSocketIO(httpServer);

// Apply socket authentication middleware
io.use(socketAuthMiddleware);

// Setup room socket handlers
setupRoomSocket(io);

// Pass io to ghost scheduler for room deletion notifications
ghostScheduler.setSocketIO(io);

// Add socket stats endpoint
app.get('/socket-stats', (req, res) => {
  const stats = getSocketStats();
  res.json({
    success: true,
    data: {
      connectedSockets: io.engine.clientsCount,
      ...stats,
    },
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Verify email service
    // await emailService.verifyConnection();

    // Initialize Ghost Protocol (schedulers)
    ghostScheduler.init();

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 ================================`);
      console.log(`   CHUGLI SERVER STARTED`);
      console.log(`================================`);
      console.log(`📍 Environment: ${envConfig.nodeEnv}`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📡 Health: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api/v1`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/v1/auth`);
      console.log(`🏠 Rooms: http://localhost:${PORT}/api/v1/rooms`);
      console.log(`🔌 Socket: ws://localhost:${PORT}`);
      console.log(`📊 Stats: http://localhost:${PORT}/socket-stats`);
      console.log(`================================\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  ghostScheduler.stopAll();

  // Close all socket connections
  io.close(() => {
    console.log('🔌 Socket.io closed');
  });

  httpServer.close(() => {
    console.log('💤 Server closed.');
    process.exit(0);
  });
});

// Start the server
startServer();

export { httpServer, io };
