// src/services/socket.js (Updated with better reconnection)

import { io } from "socket.io-client";
import { store } from "@/app/store";
import { SOCKET_URL, SOCKET_EVENTS } from "@/utils/constants";
import {
  setConnected,
  roomJoined,
  roomJoinFailed,
  addMessage,
  setUsers,
  userJoined,
  userLeft,
  userStartedTyping,
  userStoppedTyping,
  roomDeleted,
} from "@/features/chat/chatSlice";
import { updateRoomMembers } from "@/features/room/roomSlice";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize socket connection
   */
  connect() {
    if (this.socket?.connected || this.isConnecting) {
      return this.socket;
    }

    const state = store.getState();
    const accessToken = state.auth.accessToken;

    if (!accessToken) {
      console.warn("Cannot connect socket: No access token");
      return null;
    }

    this.isConnecting = true;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupListeners();

    return this.socket;
  }

  /**
   * Setup socket event listeners
   */
  setupListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("🔌 Socket connected:", this.socket.id);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      store.dispatch(setConnected(true));
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      store.dispatch(setConnected(false));
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
      store.dispatch(setConnected(false));
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("🔌 Socket reconnected after", attemptNumber, "attempts");
      store.dispatch(setConnected(true));
    });

    this.socket.on("reconnect_failed", () => {
      console.error("🔌 Socket reconnection failed");
      store.dispatch(setConnected(false));
    });

    // Room events
    this.socket.on(SOCKET_EVENTS.USERS_LIST, (data) => {
      store.dispatch(setUsers(data));
    });

    this.socket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      store.dispatch(userJoined(data));

      // Update room members count
      const chatState = store.getState().chat;
      if (chatState.currentRoomId) {
        store.dispatch(
          updateRoomMembers({
            roomId: chatState.currentRoomId,
            activeMembers: data.activeCount,
          })
        );
      }
    });

    this.socket.on(SOCKET_EVENTS.USER_LEFT, (data) => {
      store.dispatch(userLeft(data));

      // Update room members count
      const chatState = store.getState().chat;
      if (chatState.currentRoomId) {
        store.dispatch(
          updateRoomMembers({
            roomId: chatState.currentRoomId,
            activeMembers: data.activeCount,
          })
        );
      }
    });

    // Message events
    this.socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message) => {
      const state = store.getState();
      store.dispatch(
        addMessage({
          ...message,
          currentUserId: state.auth.user?._id,
        })
      );
    });

    // Typing events
    this.socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      store.dispatch(userStartedTyping(data.user));
    });

    this.socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      store.dispatch(userStoppedTyping(data.user));
    });

    // Room deleted event
    this.socket.on(SOCKET_EVENTS.ROOM_DELETED, (data) => {
      store.dispatch(roomDeleted(data));
    });

    // Error handling
    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error("Socket error:", error);
    });
  }

  /**
   * Join a room
   */
  joinRoom(roomId, password = "") {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Join room timeout"));
      }, 10000);

      this.socket.emit(
        SOCKET_EVENTS.JOIN_ROOM,
        { roomId, password },
        (response) => {
          clearTimeout(timeout);

          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || "Failed to join room"));
          }
        }
      );
    });
  }

  /**
   * Leave current room
   */
  leaveRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        resolve({ success: true });
        return;
      }

      const timeout = setTimeout(() => {
        resolve({ success: true }); // Resolve anyway on timeout
      }, 5000);

      this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId }, (response) => {
        clearTimeout(timeout);

        if (response?.success) {
          resolve(response);
        } else {
          resolve({ success: true }); // Resolve anyway
        }
      });
    });
  }

  /**
   * Send message
   */
  sendMessage(roomId, message, type = "text") {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Send message timeout"));
      }, 10000);

      this.socket.emit(
        SOCKET_EVENTS.SEND_MESSAGE,
        { roomId, message, type },
        (response) => {
          clearTimeout(timeout);

          if (response?.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || "Failed to send message"));
          }
        }
      );
    });
  }

  /**
   * Start typing indicator
   */
  startTyping(roomId) {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.TYPING_START, { roomId });
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping(roomId) {
    if (this.socket?.connected) {
      this.socket.emit(SOCKET_EVENTS.TYPING_STOP, { roomId });
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    store.dispatch(setConnected(false));
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Force reconnect
   */
  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 500);
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
