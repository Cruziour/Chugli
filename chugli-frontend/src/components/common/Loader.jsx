// src/components/common/Loader.jsx

import { Loader2 } from "lucide-react";
import Logo from "./Logo";

// Spinner Loader
export const Spinner = ({ size = "default", className = "" }) => {
  const sizes = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-10 h-10",
  };

  return (
    <Loader2
      className={`${sizes[size]} animate-spin text-primary-500 ${className}`}
    />
  );
};

// Full Page Loader
export const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-dark-950 flex flex-col items-center justify-center z-50">
      <div className="animate-pulse-neon">
        <Logo size="large" />
      </div>
      <div className="mt-8 flex items-center gap-3">
        <Spinner size="default" />
        <span className="text-dark-400">{message}</span>
      </div>
    </div>
  );
};

// Skeleton Loader
export const Skeleton = ({ className = "", variant = "text" }) => {
  const variants = {
    text: "h-4 rounded",
    title: "h-6 rounded",
    avatar: "w-10 h-10 rounded-full",
    card: "h-32 rounded-xl",
    button: "h-10 w-24 rounded-lg",
  };

  return <div className={`skeleton ${variants[variant]} ${className}`} />;
};

// Skeleton Card
export const SkeletonCard = () => {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-3/4" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default { Spinner, PageLoader, Skeleton, SkeletonCard };
