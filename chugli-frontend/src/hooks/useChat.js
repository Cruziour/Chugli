// src/hooks/useChat.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import socketService from "@/services/socket";
import {
  selectChat,
  startJoiningRoom,
  roomJoined,
  roomJoinFailed,
  leaveRoom as leaveRoomAction,
  addMessage,
  setSending,
  clearTypingUsers,
} from "@/features/chat/chatSlice";
import { selectUser } from "@/features/auth/authSlice";
import { getRoomById } from "@/features/room/roomSlice";

export const useChat = (roomId) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const chat = useSelector(selectChat);
  const user = useSelector(selectUser);
  const { currentRoom } = useSelector((state) => state.room);

  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [isRoomDeleted, setIsRoomDeleted] = useState(false);
  const hasJoinedRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Get password from location state (for private rooms)
  const password = location.state?.password || "";

  // Fetch room details
  useEffect(() => {
    if (roomId) {
      dispatch(getRoomById(roomId));
    }
  }, [dispatch, roomId]);

  // Connect and join room
  useEffect(() => {
    if (!roomId || hasJoinedRef.current) return;

    const joinRoom = async () => {
      try {
        setConnectionStatus("connecting");
        dispatch(startJoiningRoom({ roomId, roomName: currentRoom?.name }));

        // Ensure socket is connected
        if (!socketService.isConnected()) {
          socketService.connect();
          // Wait for connection
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("Connection timeout")),
              10000
            );

            const checkConnection = setInterval(() => {
              if (socketService.isConnected()) {
                clearInterval(checkConnection);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        // Join the room
        const result = await socketService.joinRoom(roomId, password);

        dispatch(roomJoined(result));
        setConnectionStatus("connected");
        hasJoinedRef.current = true;
      } catch (error) {
        console.error("Failed to join room:", error);
        dispatch(roomJoinFailed(error.message));
        setConnectionStatus("error");
        toast.error(error.message || "Failed to join room");

        // Redirect back if join failed
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    };

    joinRoom();
  }, [roomId, password, dispatch, navigate, currentRoom?.name]);

  // Handle room deleted event
  useEffect(() => {
    const handleRoomDeleted = (data) => {
      if (data.roomId === roomId) {
        setIsRoomDeleted(true);
        toast.error("This room has been deleted");
      }
    };

    const socket = socketService.getSocket();
    if (socket) {
      socket.on("room_deleted", handleRoomDeleted);
    }

    return () => {
      if (socket) {
        socket.off("room_deleted", handleRoomDeleted);
      }
    };
  }, [roomId]);

  // Handle disconnect/reconnect
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleDisconnect = () => {
      setConnectionStatus("disconnected");
    };

    const handleReconnect = () => {
      setConnectionStatus("connected");
      // Rejoin room on reconnect
      if (roomId && hasJoinedRef.current) {
        socketService.joinRoom(roomId, password).catch(console.error);
      }
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [roomId, password]);

  // Leave room on unmount
  useEffect(() => {
    return () => {
      if (hasJoinedRef.current && roomId) {
        socketService.leaveRoom(roomId).catch(console.error);
        dispatch(leaveRoomAction());
        dispatch(clearTypingUsers());
        hasJoinedRef.current = false;
      }
    };
  }, [roomId, dispatch]);

  // Send message
  const sendMessage = useCallback(
    async (message) => {
      if (!message.trim() || !chat.isJoined) return;

      dispatch(setSending(true));

      try {
        await socketService.sendMessage(roomId, message.trim());
        // Stop typing indicator
        socketService.stopTyping(roomId);
      } catch (error) {
        toast.error("Failed to send message");
        throw error;
      } finally {
        dispatch(setSending(false));
      }
    },
    [dispatch, roomId, chat.isJoined]
  );

  // Typing indicators
  const startTyping = useCallback(() => {
    if (roomId && chat.isJoined) {
      socketService.startTyping(roomId);
    }
  }, [roomId, chat.isJoined]);

  const stopTyping = useCallback(() => {
    if (roomId && chat.isJoined) {
      socketService.stopTyping(roomId);
    }
  }, [roomId, chat.isJoined]);

  // Leave room manually
  const leaveRoom = useCallback(async () => {
    if (roomId) {
      try {
        await socketService.leaveRoom(roomId);
      } catch (error) {
        console.error("Error leaving room:", error);
      }
      dispatch(leaveRoomAction());
      dispatch(clearTypingUsers());
      hasJoinedRef.current = false;
    }
  }, [roomId, dispatch]);

  // Retry connection
  const retryConnection = useCallback(() => {
    hasJoinedRef.current = false;
    setConnectionStatus("connecting");

    // Force reconnect
    socketService.disconnect();
    setTimeout(() => {
      socketService.connect();
    }, 500);
  }, []);

  return {
    // State
    room: currentRoom,
    messages: chat.messages,
    users: chat.users,
    activeCount: chat.activeCount,
    typingUsers: chat.typingUsers,
    isJoining: chat.isJoining,
    isJoined: chat.isJoined,
    isSending: chat.isSending,
    joinError: chat.joinError,
    connectionStatus,
    isRoomDeleted,
    currentUserId: user?._id,

    // Actions
    sendMessage,
    startTyping,
    stopTyping,
    leaveRoom,
    retryConnection,
  };
};

export default useChat;
