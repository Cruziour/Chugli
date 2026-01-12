// src/pages/chat/ChatPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import UsersSidebar from "@/components/chat/UsersSidebar";
import ConnectionStatus from "@/components/chat/ConnectionStatus";
import RoomDeletedModal from "@/components/chat/RoomDeletedModal";
import { useChat } from "@/hooks/useChat";

const ChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const {
    room,
    messages,
    users,
    activeCount,
    typingUsers,
    isJoining,
    isJoined,
    isSending,
    joinError,
    connectionStatus,
    isRoomDeleted,
    currentUserId,
    sendMessage,
    startTyping,
    stopTyping,
    leaveRoom,
    retryConnection,
  } = useChat(roomId);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect if no roomId
  useEffect(() => {
    if (!roomId) {
      navigate("/dashboard");
    }
  }, [roomId, navigate]);

  // Loading state
  if (isJoining && !isJoined) {
    return (
      <div className="h-screen bg-dark-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <p className="text-dark-400">Joining room...</p>
      </div>
    );
  }

  // Error state
  if (joinError && !isJoined) {
    return (
      <div className="h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Failed to Join Room
          </h2>
          <p className="text-dark-400 mb-6">{joinError}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Connection Status Banner */}
      {connectionStatus !== "connected" && (
        <ConnectionStatus status={connectionStatus} onRetry={retryConnection} />
      )}

      {/* Header */}
      <ChatHeader
        room={room}
        activeCount={activeCount}
        isConnected={connectionStatus === "connected"}
        onLeave={leaveRoom}
        onShowUsers={() => setShowSidebar(!showSidebar)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              typingUsers={typingUsers}
            />
          </div>

          {/* Input */}
          <MessageInput
            onSend={sendMessage}
            onTypingStart={startTyping}
            onTypingStop={stopTyping}
            disabled={!isJoined || connectionStatus !== "connected"}
            placeholder={
              connectionStatus !== "connected"
                ? "Reconnecting..."
                : "Type a message..."
            }
          />
        </div>

        {/* Desktop Sidebar */}
        {showSidebar && !isMobile && (
          <div className="hidden md:block w-64 lg:w-72 border-l border-dark-800 bg-dark-900">
            <UsersSidebar
              users={users}
              currentUserId={currentUserId}
              creatorId={room?.creator?._id}
              typingUsers={typingUsers}
            />
          </div>
        )}
      </div>

      {/* Mobile Sidebar Toggle */}
      {isMobile && (
        <MobileSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          users={users}
          currentUserId={currentUserId}
          creatorId={room?.creator?._id}
          typingUsers={typingUsers}
        />
      )}

      {/* Room Deleted Modal */}
      <RoomDeletedModal isOpen={isRoomDeleted} roomName={room?.name} />
    </div>
  );
};

// Mobile Sidebar Component
const MobileSidebar = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  creatorId,
  typingUsers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-72 bg-dark-900 border-l border-dark-800 animate-slide-left">
        <UsersSidebar
          users={users}
          currentUserId={currentUserId}
          creatorId={creatorId}
          typingUsers={typingUsers}
        />
      </div>
    </div>
  );
};

export default ChatPage;
