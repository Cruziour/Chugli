// src/components/profile/SettingsItem.jsx

import { ChevronRight } from "lucide-react";

const SettingsItem = ({
  icon: Icon,
  iconColor = "text-dark-400",
  iconBg = "bg-dark-700",
  title,
  description,
  onClick,
  showArrow = true,
  rightIcon,
  badge,
  danger = false,
  disabled = false,
}) => {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-4 p-4 text-left
        transition-colors
        ${onClick && !disabled ? "hover:bg-dark-700/50 cursor-pointer" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${danger ? "hover:bg-red-500/10" : ""}
      `}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-5 h-5 ${danger ? "text-red-400" : iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium ${danger ? "text-red-400" : "text-white"}`}>
          {title}
        </h3>
        {description && (
          <p className="text-sm text-dark-400 truncate">{description}</p>
        )}
      </div>

      {/* Badge */}
      {badge && <div className="flex-shrink-0">{badge}</div>}

      {/* Arrow */}
      {showArrow && onClick && !rightIcon && (
        <ChevronRight
          className={`w-5 h-5 flex-shrink-0 ${
            danger ? "text-red-400" : "text-dark-500"
          }`}
        />
      )}

      {/* Custom Right Icon */}
      {rightIcon && (
        <div className="text-dark-500 flex-shrink-0">{rightIcon}</div>
      )}
    </Component>
  );
};

export default SettingsItem;
