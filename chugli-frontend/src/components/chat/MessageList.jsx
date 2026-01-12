// src/components/chat/MessageList.jsx

import { useEffect, useRef, useState, memo, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

const MessageList = memo(
  ({ messages = [], currentUserId, typingUsers = [] }) => {
    const listRef = useRef(null);
    const bottomRef = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(true);

    // Check if user is near bottom
    const checkScrollPosition = useCallback(() => {
      if (listRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const nearBottom = distanceFromBottom < 100;

        setIsNearBottom(nearBottom);
        setShowScrollButton(!nearBottom && messages.length > 0);
      }
    }, [messages.length]);

    // Scroll to bottom
    const scrollToBottom = useCallback((smooth = true) => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
        });
      }
    }, []);

    // Auto-scroll on new messages if near bottom
    useEffect(() => {
      if (isNearBottom) {
        scrollToBottom(true);
      }
    }, [messages, isNearBottom, scrollToBottom]);

    // Initial scroll to bottom
    useEffect(() => {
      scrollToBottom(false);
    }, []);

    // Handle scroll events
    useEffect(() => {
      const listElement = listRef.current;
      if (listElement) {
        listElement.addEventListener("scroll", checkScrollPosition);
        return () =>
          listElement.removeEventListener("scroll", checkScrollPosition);
      }
    }, [checkScrollPosition]);

    // Check if message is from same sender as previous (for grouping)
    const isConsecutive = (index) => {
      if (index === 0) return false;
      const currentMsg = messages[index];
      const prevMsg = messages[index - 1];

      if (currentMsg.type === "system" || prevMsg.type === "system")
        return false;
      if (currentMsg.sender?.oderId !== prevMsg.sender?.oderId) return false;

      // Check if within 2 minutes
      const currentTime = new Date(currentMsg.timestamp).getTime();
      const prevTime = new Date(prevMsg.timestamp).getTime();
      return currentTime - prevTime < 120000; // 2 minutes
    };

    return (
      <div className="relative h-full">
        {/* Messages Container */}
        <div
          ref={listRef}
          className="h-full overflow-y-auto overflow-x-hidden py-4 no-scrollbar"
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No messages yet
              </h3>
              <p className="text-dark-400 text-sm max-w-sm">
                Be the first to say something! Messages are not stored and will
                disappear when you leave.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender?.oderId === currentUserId}
              isConsecutive={isConsecutive(index)}
              showAvatar={!isConsecutive(index)}
            />
          ))}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 right-4 p-3 bg-dark-800 border border-dark-700 
                   text-white rounded-full shadow-lg hover:bg-dark-700 
                   transition-all animate-fade-in z-10"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

MessageList.displayName = "MessageList";

export default MessageList;
