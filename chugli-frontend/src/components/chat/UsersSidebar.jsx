// src/components/chat/UsersSidebar.jsx

import { memo } from "react";
import { Crown, User } from "lucide-react";
import Avatar from "@/components/common/Avatar";
import { timeAgo } from "@/utils/helpers";

const UsersSidebar = memo(
  ({ users = [], currentUserId, creatorId, typingUsers = [] }) => {
    // Sort users: creator first, then alphabetically
    const sortedUsers = [...users].sort((a, b) => {
      if (a.oderId === creatorId) return -1;
      if (b.oderId === creatorId) return 1;
      return (a.username || "").localeCompare(b.username || "");
    });

    const isTyping = (userId) => {
      return typingUsers.some((u) => u.oderId === userId);
    };

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-dark-800">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Online Users
            <span className="ml-auto text-sm font-normal text-dark-400">
              {users.length}
            </span>
          </h3>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedUsers.length === 0 ? (
            <div className="text-center py-8 text-dark-500 text-sm">
              No other users online
            </div>
          ) : (
            <div className="space-y-1">
              {sortedUsers.map((user) => (
                <UserItem
                  key={user.oderId}
                  user={user}
                  isCreator={user.oderId === creatorId}
                  isCurrentUser={user.oderId === currentUserId}
                  isTyping={isTyping(user.oderId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-800">
          <p className="text-xs text-dark-500 text-center">
            Users disappear when they leave the room
          </p>
        </div>
      </div>
    );
  }
);

// Individual User Item
const UserItem = memo(({ user, isCreator, isCurrentUser, isTyping }) => {
  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-colors
        ${
          isCurrentUser
            ? "bg-primary-500/10 border border-primary-500/30"
            : "hover:bg-dark-800"
        }
      `}
    >
      {/* Avatar with Status */}
      <div className="relative">
        <Avatar username={user.username} size="small" />
        {/* Online indicator */}
        <span
          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full 
                       border-2 border-dark-900"
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium truncate ${
              isCurrentUser ? "text-primary-400" : "text-white"
            }`}
          >
            {user.username}
            {isCurrentUser && (
              <span className="text-dark-400 font-normal"> (you)</span>
            )}
          </span>

          {isCreator && (
            <Crown className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          )}
        </div>

        {/* Typing indicator or joined time */}
        <div className="text-xs text-dark-500">
          {isTyping ? (
            <span className="text-primary-400 flex items-center gap-1">
              <span className="flex gap-0.5">
                <span
                  className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1 h-1 bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              typing...
            </span>
          ) : (
            <span>Joined {timeAgo(user.joinedAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
});

UsersSidebar.displayName = "UsersSidebar";
UserItem.displayName = "UserItem";

export default UsersSidebar;
