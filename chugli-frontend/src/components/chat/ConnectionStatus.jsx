// src/components/chat/ConnectionStatus.jsx

import { memo } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

const ConnectionStatus = memo(
  ({
    status = "connecting", // 'connected' | 'connecting' | 'disconnected' | 'error'
    onRetry,
  }) => {
    const configs = {
      connected: {
        icon: Wifi,
        text: "Connected",
        color: "text-green-400",
        bg: "bg-green-500/10 border-green-500/30",
        show: false,
      },
      connecting: {
        icon: Loader2,
        text: "Connecting...",
        color: "text-yellow-400",
        bg: "bg-yellow-500/10 border-yellow-500/30",
        animate: true,
        show: true,
      },
      disconnected: {
        icon: WifiOff,
        text: "Disconnected",
        color: "text-red-400",
        bg: "bg-red-500/10 border-red-500/30",
        show: true,
      },
      error: {
        icon: WifiOff,
        text: "Connection failed",
        color: "text-red-400",
        bg: "bg-red-500/10 border-red-500/30",
        show: true,
      },
    };

    const config = configs[status] || configs.connecting;

    if (!config.show) return null;

    return (
      <div
        className={`
      flex items-center justify-center gap-2 px-4 py-2
      ${config.bg} border-b
    `}
      >
        <config.icon
          className={`w-4 h-4 ${config.color} ${
            config.animate ? "animate-spin" : ""
          }`}
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>

        {(status === "disconnected" || status === "error") && onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-sm text-primary-400 hover:text-primary-300 
                   underline transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }
);

ConnectionStatus.displayName = "ConnectionStatus";

export default ConnectionStatus;
