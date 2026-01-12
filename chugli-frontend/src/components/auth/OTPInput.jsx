// src/components/auth/OTPInput.jsx

import { useState, useRef, useEffect } from "react";

const OTPInput = ({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Sync with external value
  useEffect(() => {
    if (value) {
      const valueArray = value.split("").slice(0, length);
      const newOtp = [...new Array(length).fill("")];
      valueArray.forEach((char, index) => {
        newOtp[index] = char;
      });
      setOtp(newOtp);
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];

    // Handle paste
    if (val.length > 1) {
      const pastedValue = val.slice(0, length - index);
      for (let i = 0; i < pastedValue.length; i++) {
        if (index + i < length) {
          newOtp[index + i] = pastedValue[i];
        }
      }
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      // Focus last filled or next empty
      const nextIndex = Math.min(index + pastedValue.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single character input
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    onChange?.(newOtp.join(""));

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous on backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Arrow keys navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (pastedData) {
      const newOtp = [...new Array(length).fill("")];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      // Focus last filled input
      const lastIndex = Math.min(pastedData.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={length}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={handleFocus}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-10 h-12 sm:w-12 sm:h-14
            text-center text-xl sm:text-2xl font-bold
            bg-dark-800 border-2 rounded-lg
            text-white
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-dark-600 hover:border-dark-500"
            }
            ${digit ? "border-primary-500" : ""}
          `}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
