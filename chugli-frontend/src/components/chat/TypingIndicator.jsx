// src/components/chat/TypingIndicator.jsx

import { memo } from "react";
import Avatar from "@/components/common/Avatar";

const TypingIndicator = memo(({ users = [] }) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
      {/* Avatars Stack */}
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, index) => (
          <div
            key={user.oderId}
            className="relative"
            style={{ zIndex: 3 - index }}
          >
            <Avatar
              username={user.username}
              size="small"
              className="ring-2 ring-dark-900"
            />
          </div>
        ))}
      </div>

      {/* Typing Text with Animation */}
      <div className="flex items-center gap-2 bg-dark-800 rounded-full px-4 py-2">
        {/* Bouncing Dots */}
        <div className="flex gap-1">
          <span
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "600ms" }}
          />
          <span
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "600ms" }}
          />
          <span
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "600ms" }}
          />
        </div>

        {/* Text */}
        <span className="text-sm text-dark-400">{getTypingText()}</span>
      </div>
    </div>
  );
});

TypingIndicator.displayName = "TypingIndicator";

export default TypingIndicator;
