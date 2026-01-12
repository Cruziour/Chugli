// src/components/common/Button.jsx

import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "default",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    default: "px-6 py-3",
    large: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
        inline-flex items-center justify-center gap-2
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="w-5 h-5">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="w-5 h-5">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
