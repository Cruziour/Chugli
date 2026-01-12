// src/components/chat/MessageItem.jsx

import { memo } from "react";
import Avatar from "@/components/common/Avatar";
import { formatMessageTime } from "@/utils/helpers";

const MessageItem = memo(
  ({ message, isOwn = false, showAvatar = true, isConsecutive = false }) => {
    // System message
    if (message.type === "system") {
      return (
        <div className="flex justify-center my-4">
          <div className="px-4 py-2 bg-dark-800/50 rounded-full">
            <p className="text-xs text-dark-400">{message.message}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex gap-3 px-4 py-1 ${isOwn ? "flex-row-reverse" : ""} ${
          isConsecutive ? "pt-0.5" : "pt-3"
        }`}
      >
        {/* Avatar */}
        {showAvatar && !isConsecutive ? (
          <Avatar
            username={message.sender?.username}
            size="small"
            className="flex-shrink-0 mt-1"
          />
        ) : (
          <div className="w-8 flex-shrink-0" />
        )}

        {/* Message Content */}
        <div
          className={`flex flex-col max-w-[75%] md:max-w-[60%] ${
            isOwn ? "items-end" : "items-start"
          }`}
        >
          {/* Sender Name (only for first in group) */}
          {!isOwn && !isConsecutive && (
            <span className="text-xs text-primary-400 font-medium mb-1 px-1">
              {message.sender?.username}
            </span>
          )}

          {/* Message Bubble */}
          <div
            className={`
            relative px-4 py-2 rounded-2xl break-words
            ${
              isOwn
                ? "bg-primary-600 text-white rounded-br-md"
                : "bg-dark-800 text-dark-100 rounded-bl-md"
            }
          `}
          >
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>

            {/* Timestamp */}
            <span
              className={`text-[10px] ml-2 ${
                isOwn ? "text-primary-200" : "text-dark-500"
              }`}
            >
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default MessageItem;
