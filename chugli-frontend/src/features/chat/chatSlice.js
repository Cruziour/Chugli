// src/features/chat/chatSlice.js

import { createSlice } from "@reduxjs/toolkit";

/**
 * Chat Slice - RAM Only Storage
 *
 * This slice stores all chat data in Redux state only.
 * When user leaves room or refreshes page, all messages are lost.
 * This is by design for privacy - ZERO DATA FOOTPRINT.
 */

// ============== Initial State ==============

const initialState = {
  // Current room info
  currentRoomId: null,
  currentRoomName: null,

  // Messages for current room (RAM only - never persisted)
  messages: [],

  // Users in current room
  users: [],
  activeCount: 0,

  // Connection status
  isConnected: false,
  isJoining: false,
  isJoined: false,
  joinError: null,

  // Typing indicators
  typingUsers: [], // [{userId, username}]

  // Message sending status
  isSending: false,
  sendError: null,

  // Unread count (for when tab is not focused)
  unreadCount: 0,
};

// ============== Slice ==============

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // ============== Connection ==============

    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },

    // ============== Room Join/Leave ==============

    startJoiningRoom: (state, action) => {
      const { roomId, roomName } = action.payload;
      state.currentRoomId = roomId;
      state.currentRoomName = roomName;
      state.isJoining = true;
      state.joinError = null;
      state.messages = []; // Clear previous messages
      state.users = [];
      state.typingUsers = [];
    },

    roomJoined: (state, action) => {
      const { room, members, activeCount } = action.payload;
      state.isJoining = false;
      state.isJoined = true;
      state.currentRoomName = room?.name || state.currentRoomName;
      state.users = members || [];
      state.activeCount = activeCount || members?.length || 0;

      // Add system message
      state.messages.push({
        id: `system_${Date.now()}`,
        type: "system",
        message: "You joined the room",
        timestamp: new Date().toISOString(),
      });
    },

    roomJoinFailed: (state, action) => {
      state.isJoining = false;
      state.isJoined = false;
      state.joinError = action.payload;
      state.currentRoomId = null;
      state.currentRoomName = null;
    },

    leaveRoom: (state) => {
      // Clear all room data - messages gone forever (by design)
      state.currentRoomId = null;
      state.currentRoomName = null;
      state.messages = [];
      state.users = [];
      state.activeCount = 0;
      state.isJoined = false;
      state.typingUsers = [];
      state.unreadCount = 0;
    },

    roomDeleted: (state, action) => {
      const { roomId, message } = action.payload;

      if (state.currentRoomId === roomId) {
        // Add system message before clearing
        state.messages.push({
          id: `system_${Date.now()}`,
          type: "system",
          message: message || "Room has been deleted",
          timestamp: new Date().toISOString(),
        });

        state.isJoined = false;
      }
    },

    // ============== Messages ==============

    addMessage: (state, action) => {
      const message = action.payload;

      // Prevent duplicates
      if (!state.messages.some((m) => m.id === message.id)) {
        state.messages.push(message);

        // Limit messages in memory (keep last 500)
        if (state.messages.length > 500) {
          state.messages = state.messages.slice(-500);
        }

        // Increment unread if not own message
        if (
          message.type !== "system" &&
          message.sender?.oderId !== action.payload.currentUserId
        ) {
          state.unreadCount += 1;
        }
      }
    },

    setSending: (state, action) => {
      state.isSending = action.payload;
    },

    setSendError: (state, action) => {
      state.sendError = action.payload;
    },

    clearMessages: (state) => {
      state.messages = [];
    },

    clearUnread: (state) => {
      state.unreadCount = 0;
    },

    // ============== Users ==============

    setUsers: (state, action) => {
      const { members, activeCount } = action.payload;
      state.users = members || [];
      state.activeCount = activeCount || members?.length || 0;
    },

    userJoined: (state, action) => {
      const { user, members, activeCount } = action.payload;

      state.users = members || state.users;
      state.activeCount = activeCount || state.users.length;

      // Add system message
      state.messages.push({
        id: `system_${Date.now()}`,
        type: "system",
        message: `${user.username} joined the room`,
        timestamp: new Date().toISOString(),
      });
    },

    userLeft: (state, action) => {
      const { user, members, activeCount } = action.payload;

      state.users =
        members || state.users.filter((u) => u.oderId !== user.oderId);
      state.activeCount = activeCount || state.users.length;

      // Remove from typing
      state.typingUsers = state.typingUsers.filter(
        (u) => u.oderId !== user.oderId
      );

      // Add system message
      state.messages.push({
        id: `system_${Date.now()}`,
        type: "system",
        message: `${user.username} left the room`,
        timestamp: new Date().toISOString(),
      });
    },

    // ============== Typing Indicators ==============

    userStartedTyping: (state, action) => {
      const user = action.payload;

      // Add if not already typing
      if (!state.typingUsers.some((u) => u.oderId === user.oderId)) {
        state.typingUsers.push(user);
      }
    },

    userStoppedTyping: (state, action) => {
      const user = action.payload;
      state.typingUsers = state.typingUsers.filter(
        (u) => u.oderId !== user.oderId
      );
    },

    clearTypingUsers: (state) => {
      state.typingUsers = [];
    },

    // ============== Reset ==============

    resetChat: () => initialState,
  },
});

// Export actions
export const {
  setConnected,
  startJoiningRoom,
  roomJoined,
  roomJoinFailed,
  leaveRoom,
  roomDeleted,
  addMessage,
  setSending,
  setSendError,
  clearMessages,
  clearUnread,
  setUsers,
  userJoined,
  userLeft,
  userStartedTyping,
  userStoppedTyping,
  clearTypingUsers,
  resetChat,
} = chatSlice.actions;

// Export selectors
export const selectChat = (state) => state.chat;
export const selectMessages = (state) => state.chat.messages;
export const selectUsers = (state) => state.chat.users;
export const selectActiveCount = (state) => state.chat.activeCount;
export const selectTypingUsers = (state) => state.chat.typingUsers;
export const selectIsJoined = (state) => state.chat.isJoined;
export const selectCurrentRoomId = (state) => state.chat.currentRoomId;
export const selectUnreadCount = (state) => state.chat.unreadCount;

// Export reducer
export default chatSlice.reducer;
