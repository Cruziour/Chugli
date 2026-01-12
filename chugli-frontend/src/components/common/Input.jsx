// src/components/common/Input.jsx

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`w-full ${className}`}>
        {label && <label className="input-label">{label}</label>}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`
            input-field
            ${leftIcon ? "pl-10" : ""}
            ${isPassword || rightIcon ? "pr-10" : ""}
            ${error ? "input-error" : ""}
          `}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 
                       hover:text-dark-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error && <p className="error-text">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-dark-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
