// src/components/chat/MessageInput.jsx

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Smile, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const MessageInput = ({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled = false,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Debounced typing status
  const debouncedMessage = useDebounce(message, 500);

  // Handle typing indicator
  useEffect(() => {
    if (message.length > 0 && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTypingStart, onTypingStop]);

  // Stop typing when message is empty
  useEffect(() => {
    if (message.length === 0 && isTyping) {
      setIsTyping(false);
      onTypingStop?.();
    }
  }, [message, isTyping, onTypingStop]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSend = useCallback(async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending || disabled) return;

    setIsSending(true);

    try {
      await onSend?.(trimmedMessage);
      setMessage("");
      setIsTyping(false);
      onTypingStop?.();

      // Refocus input
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, disabled, onSend, onTypingStop]);

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    // Limit message length
    if (value.length <= 1000) {
      setMessage(value);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  return (
    <div className="bg-dark-900 border-t border-dark-800 p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        {/* Input Container */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            rows={1}
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl
                     text-white placeholder-dark-500 resize-none
                     focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all max-h-[120px]"
            style={{ minHeight: "48px" }}
          />

          {/* Character Count */}
          {message.length > 800 && (
            <span
              className={`absolute right-3 bottom-1 text-xs ${
                message.length > 950 ? "text-red-400" : "text-dark-500"
              }`}
            >
              {message.length}/1000
            </span>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending || disabled}
          className="p-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600
                   transition-all flex-shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-xs text-dark-600 mt-2">
        🔒 Messages are not stored. They'll disappear when you leave.
      </p>
    </div>
  );
};

export default MessageInput;
