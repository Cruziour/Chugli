// src/components/common/ToastConfig.jsx

import { Toaster } from "react-hot-toast";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastConfig = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        top: 80,
      }}
      toastOptions={{
        duration: 4000,

        // Default style
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #334155",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
        },

        // Success toast
        success: {
          duration: 3000,
          style: {
            background: "#1e293b",
            border: "1px solid #10b981",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#f1f5f9",
          },
        },

        // Error toast
        error: {
          duration: 5000,
          style: {
            background: "#1e293b",
            border: "1px solid #ef4444",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#f1f5f9",
          },
        },

        // Loading toast
        loading: {
          style: {
            background: "#1e293b",
            border: "1px solid #3b82f6",
          },
          iconTheme: {
            primary: "#3b82f6",
            secondary: "#f1f5f9",
          },
        },
      }}
    />
  );
};

// Custom toast functions
export const showToast = {
  success: (message) => {
    const toast = require("react-hot-toast").default;
    return toast.success(message, {
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    });
  },

  error: (message) => {
    const toast = require("react-hot-toast").default;
    return toast.error(message, {
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    });
  },

  info: (message) => {
    const toast = require("react-hot-toast").default;
    return toast(message, {
      icon: <Info className="w-5 h-5 text-primary-400" />,
      style: {
        background: "#1e293b",
        color: "#f1f5f9",
        border: "1px solid #3b82f6",
      },
    });
  },

  warning: (message) => {
    const toast = require("react-hot-toast").default;
    return toast(message, {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      style: {
        background: "#1e293b",
        color: "#f1f5f9",
        border: "1px solid #f59e0b",
      },
    });
  },

  promise: (promise, messages) => {
    const toast = require("react-hot-toast").default;
    return toast.promise(promise, messages);
  },
};

export default ToastConfig;
