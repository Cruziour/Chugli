// src/components/layout/MobileNav.jsx

import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { openCreateRoomModal } from "@/features/ui/uiSlice";

const MobileNav = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Don't show on auth pages
  const authPages = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ];
  if (authPages.includes(location.pathname)) {
    return null;
  }

  // Don't show on chat pages
  if (location.pathname.startsWith("/chat/")) {
    return null;
  }

  if (!isAuthenticated) return null;

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/my-rooms", icon: MessageCircle, label: "My Rooms" },
    { action: "create", icon: PlusCircle, label: "Create" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden 
                    bg-dark-900/95 backdrop-blur-xl border-t border-dark-800"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          if (item.action === "create") {
            return (
              <button
                key={item.action}
                onClick={() => dispatch(openCreateRoomModal())}
                className="flex flex-col items-center justify-center p-2 -mt-6"
              >
                <div
                  className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center 
                              shadow-lg shadow-primary-500/30"
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center p-2 rounded-lg
                transition-colors min-w-[60px]
                ${
                  isActive
                    ? "text-primary-400"
                    : "text-dark-500 hover:text-dark-300"
                }
              `}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
