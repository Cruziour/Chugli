// src/components/chat/ChatLayout.jsx

import { useState } from "react";
import { Users, X } from "lucide-react";

const ChatLayout = ({
  header,
  messages,
  input,
  sidebar,
  showSidebar = false,
  onToggleSidebar,
  isMobile = false,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Header */}
      <div className="flex-shrink-0">{header}</div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-hidden">{messages}</div>

          {/* Input */}
          <div className="flex-shrink-0">{input}</div>
        </div>

        {/* Desktop Sidebar */}
        {showSidebar && !isMobile && (
          <div className="hidden md:block w-64 lg:w-72 border-l border-dark-800 bg-dark-900">
            {sidebar}
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-dark-900 border-l border-dark-800 animate-slide-left">
              <div className="flex items-center justify-between p-4 border-b border-dark-800">
                <h3 className="font-semibold text-white">Online Users</h3>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Users Toggle Button */}
      {isMobile && (
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="fixed bottom-24 right-4 p-3 bg-primary-600 text-white rounded-full shadow-lg z-40"
        >
          <Users className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ChatLayout;
