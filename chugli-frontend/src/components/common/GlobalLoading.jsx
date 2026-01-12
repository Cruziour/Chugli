// src/components/common/GlobalLoading.jsx

import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import Logo from "./Logo";

const GlobalLoading = () => {
  const { isGlobalLoading, globalLoadingMessage } = useSelector(
    (state) => state.ui
  );

  if (!isGlobalLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-dark-950/90 backdrop-blur-sm z-[100] 
                  flex flex-col items-center justify-center"
    >
      <div className="animate-pulse-neon mb-6">
        <Logo size="large" />
      </div>

      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
        <span className="text-dark-300">
          {globalLoadingMessage || "Loading..."}
        </span>
      </div>
    </div>
  );
};

export default GlobalLoading;
