// src/components/common/Avatar.jsx

import { getInitials, getAvatarColor } from "@/utils/helpers";

const Avatar = ({
  username,
  src,
  size = "default",
  showStatus = false,
  isOnline = false,
  className = "",
}) => {
  const sizes = {
    small: "w-8 h-8 text-xs",
    default: "w-10 h-10 text-sm",
    large: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const statusSizes = {
    small: "w-2 h-2",
    default: "w-3 h-3",
    large: "w-4 h-4",
    xl: "w-5 h-5",
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img
          src={src}
          alt={username}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`
            ${sizes[size]} 
            ${getAvatarColor(username)}
            rounded-full flex items-center justify-center
            font-semibold text-white
          `}
        >
          {getInitials(username)}
        </div>
      )}

      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${isOnline ? "bg-green-500" : "bg-dark-500"}
            rounded-full border-2 border-dark-800
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
