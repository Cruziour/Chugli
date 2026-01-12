// src/socket/room.socket.js

import Room from '../models/room.model.js';
import { SOCKET_EVENTS } from '../utils/constants.js';

/**
 * In-memory store for room members
 * Structure: { roomId: { oderId: { username, joinedAt } } }
 */
const roomMembers = new Map();

/**
 * Get room members list
 */
const getRoomMembersList = (roomId) => {
  const members = roomMembers.get(roomId);
  if (!members) return [];

  return Array.from(members.values()).map((member) => ({
    oderId: member.oderId,
    username: member.username,
    joinedAt: member.joinedAt,
  }));
};

/**
 * Socket Room Handler
 */
export const setupRoomSocket = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // Current room tracking for this socket
    let currentRoom = null;

    /**
     * JOIN ROOM
     */
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data, callback) => {
      try {
        const { roomId, password } = data;

        // Validate room exists
        const room = await Room.findByIdWithPassword(roomId);

        if (!room || !room.isActive) {
          return callback?.({
            success: false,
            error: 'Room not found or has been deleted',
          });
        }

        // Check password for private rooms
        if (room.isPrivate) {
          const isValidPassword = await room.comparePassword(password || '');
          if (!isValidPassword) {
            return callback?.({
              success: false,
              error: 'Invalid room password',
            });
          }
        }

        // Leave current room if in one
        if (currentRoom) {
          await leaveRoom(socket, currentRoom, io);
        }

        // Join new room
        socket.join(roomId);
        currentRoom = roomId;

        // Add to room members
        if (!roomMembers.has(roomId)) {
          roomMembers.set(roomId, new Map());
        }
        roomMembers.get(roomId).set(socket.id, {
          oderId: socket.user._id,
          username: socket.user.username,
          joinedAt: new Date(),
        });

        // Update room member count in database
        await room.memberJoined();

        // Get updated members list
        const members = getRoomMembersList(roomId);

        // Notify room about new user
        socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, {
          user: {
            oderId: socket.user._id,
            username: socket.user.username,
          },
          members,
          activeCount: members.length,
        });

        // Send confirmation to the joining user
        callback?.({
          success: true,
          room: {
            _id: room._id,
            name: room.name,
            description: room.description,
            isPrivate: room.isPrivate,
          },
          members,
          activeCount: members.length,
        });

        // Send users list to the joining user
        socket.emit(SOCKET_EVENTS.USERS_LIST, {
          members,
          activeCount: members.length,
        });

        console.log(`📥 ${socket.user.username} joined room: ${room.name}`);
      } catch (error) {
        console.error('Join room error:', error.message);
        callback?.({
          success: false,
          error: 'Failed to join room',
        });
      }
    });

    /**
     * SEND MESSAGE
     * Messages are broadcast to room members without storing in database
     */
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data, callback) => {
      try {
        const { roomId, message, type = 'text' } = data;

        // Validate user is in the room
        if (currentRoom !== roomId) {
          return callback?.({
            success: false,
            error: 'You are not in this room',
          });
        }

        // Validate message
        if (!message || message.trim().length === 0) {
          return callback?.({
            success: false,
            error: 'Message cannot be empty',
          });
        }

        if (message.length > 1000) {
          return callback?.({
            success: false,
            error: 'Message too long (max 1000 characters)',
          });
        }

        // Create message object (NOT stored in database)
        const messageData = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sender: {
            oderId: socket.user._id,
            username: socket.user.username,
          },
          message: message.trim(),
          type,
          timestamp: new Date().toISOString(),
          roomId,
        };

        // Broadcast to all room members (including sender)
        io.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, messageData);

        // Update room activity
        await Room.findByIdAndUpdate(roomId, {
          lastActivityAt: new Date(),
        });

        callback?.({
          success: true,
          messageId: messageData.id,
        });
      } catch (error) {
        console.error('Send message error:', error.message);
        callback?.({
          success: false,
          error: 'Failed to send message',
        });
      }
    });

    /**
     * TYPING INDICATORS
     */
    socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      const { roomId } = data;
      if (currentRoom === roomId) {
        socket.to(roomId).emit(SOCKET_EVENTS.TYPING_START, {
          user: {
            oderId: socket.user._id,
            username: socket.user.username,
          },
        });
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      const { roomId } = data;
      if (currentRoom === roomId) {
        socket.to(roomId).emit(SOCKET_EVENTS.TYPING_STOP, {
          user: {
            oderId: socket.user._id,
            username: socket.user.username,
          },
        });
      }
    });

    /**
     * LEAVE ROOM
     */
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (data, callback) => {
      try {
        const { roomId } = data;

        if (currentRoom === roomId) {
          await leaveRoom(socket, roomId, io);
          currentRoom = null;

          callback?.({
            success: true,
            message: 'Left room successfully',
          });
        } else {
          callback?.({
            success: false,
            error: 'You are not in this room',
          });
        }
      } catch (error) {
        console.error('Leave room error:', error.message);
        callback?.({
          success: false,
          error: 'Failed to leave room',
        });
      }
    });

    /**
     * DISCONNECT
     */
    socket.on(SOCKET_EVENTS.DISCONNECT, async (reason) => {
      console.log(`🔌 User disconnected: ${socket.user.username} (${reason})`);

      if (currentRoom) {
        await leaveRoom(socket, currentRoom, io);
      }
    });

    /**
     * ERROR HANDLING
     */
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.user.username}:`, error.message);
    });
  });

  return io;
};

/**
 * Helper function to leave a room
 */
const leaveRoom = async (socket, roomId, io) => {
  try {
    // Remove from socket room
    socket.leave(roomId);

    // Remove from room members
    if (roomMembers.has(roomId)) {
      roomMembers.get(roomId).delete(socket.id);

      // Clean up empty room from memory
      if (roomMembers.get(roomId).size === 0) {
        roomMembers.delete(roomId);
      }
    }

    // Update room in database
    const room = await Room.findById(roomId);
    if (room) {
      await room.memberLeft();

      // Get updated members list
      const members = getRoomMembersList(roomId);

      // Notify remaining members
      io.to(roomId).emit(SOCKET_EVENTS.USER_LEFT, {
        user: {
          oderId: socket.user._id,
          username: socket.user.username,
        },
        members,
        activeCount: members.length,
      });

      console.log(`📤 ${socket.user.username} left room: ${room.name}`);
    }
  } catch (error) {
    console.error('Leave room helper error:', error.message);
  }
};

/**
 * Notify room deletion to all members
 */
export const notifyRoomDeletion = (io, roomId, roomName) => {
  io.to(roomId).emit(SOCKET_EVENTS.ROOM_DELETED, {
    roomId,
    roomName,
    message: 'Room has been deleted by the creator',
  });

  // Clean up room from memory
  roomMembers.delete(roomId);

  // Force all sockets to leave the room
  io.in(roomId).socketsLeave(roomId);
};

/**
 * Get active rooms statistics
 */
export const getSocketStats = () => {
  const stats = {
    activeRooms: roomMembers.size,
    rooms: [],
  };

  roomMembers.forEach((members, roomId) => {
    stats.rooms.push({
      roomId,
      memberCount: members.size,
    });
  });

  return stats;
};

export default { setupRoomSocket, notifyRoomDeletion, getSocketStats };
