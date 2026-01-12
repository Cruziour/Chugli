// src/components/chat/ChatHeader.jsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Lock,
  Unlock,
  MoreVertical,
  Info,
  LogOut,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import Avatar from "@/components/common/Avatar";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { copyToClipboard } from "@/utils/helpers";

const ChatHeader = ({
  room,
  activeCount = 0,
  isConnected = false,
  onLeave,
  onShowUsers,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useOnClickOutside(menuRef, () => setShowMenu(false));

  const handleBack = () => {
    onLeave?.();
    navigate("/dashboard");
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/chat/${room?._id}`;
    const success = await copyToClipboard(link);

    if (success) {
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
    setShowMenu(false);
  };

  const handleLeave = () => {
    setShowMenu(false);
    onLeave?.();
    navigate("/dashboard");
  };

  return (
    <header className="bg-dark-900 border-b border-dark-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 
                     rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Room Info */}
          <div className="flex items-center gap-3 min-w-0">
            <Avatar username={room?.name} size="default" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-white truncate">
                  {room?.name || "Chat Room"}
                </h1>
                {room?.isPrivate ? (
                  <Lock className="w-4 h-4 text-primary-400 flex-shrink-0" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-400 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                {/* Connection Status */}
                <span
                  className={`flex items-center gap-1 ${
                    isConnected ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected
                        ? "bg-green-400"
                        : "bg-yellow-400 animate-pulse"
                    }`}
                  />
                  {isConnected ? "Connected" : "Connecting..."}
                </span>

                <span className="text-dark-600">•</span>

                {/* Active Users */}
                <button
                  onClick={onShowUsers}
                  className="flex items-center gap-1 text-dark-400 hover:text-primary-400 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>{activeCount} online</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Users Button (Desktop) */}
          <button
            onClick={onShowUsers}
            className="hidden md:flex p-2 text-dark-400 hover:text-white 
                     hover:bg-dark-800 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-dark-400 hover:text-white 
                       hover:bg-dark-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border 
                            border-dark-700 rounded-xl shadow-xl py-2 z-50 animate-scale-in"
              >
                {/* Room Info */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // Could open room info modal
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-dark-300 
                           hover:bg-dark-700 hover:text-white transition-colors"
                >
                  <Info className="w-4 h-4" />
                  Room Info
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-dark-300 
                           hover:bg-dark-700 hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </button>

                <div className="border-t border-dark-700 my-2" />

                {/* Leave Room */}
                <button
                  onClick={handleLeave}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 
                           hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Room
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
