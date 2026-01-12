// src/components/layout/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Bell,
  LogOut,
  Settings,
  User,
  MapPin,
  Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import Logo from "@/components/common/Logo";
import Avatar from "@/components/common/Avatar";
import { logout } from "@/features/auth/authSlice";
import { openCreateRoomModal } from "@/features/ui/uiSlice";
import SearchModal from "@/components/room/SearchModal";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setShowDropdown(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <Logo size="small" />
            </Link>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
              {isAuthenticated ? (
                <>
                  {/* Search Button */}
                  <button
                    onClick={() => setShowSearch(true)}
                    className="p-2 text-dark-400 hover:text-white 
                             hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Create Room Button (Desktop) */}
                  <button
                    onClick={() => dispatch(openCreateRoomModal())}
                    className="hidden md:flex items-center gap-2 px-4 py-2 
                             bg-primary-600 hover:bg-primary-500 text-white 
                             font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark-800 transition-colors"
                    >
                      <Avatar username={user?.username} size="small" />
                      <span className="hidden md:block text-sm font-medium text-dark-200">
                        {user?.username}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                      <div
                        className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 
                                    rounded-xl shadow-xl py-2 animate-scale-in origin-top-right"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-dark-700">
                          <p className="text-sm font-medium text-white">
                            {user?.username}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {user?.email}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 
                                     hover:bg-dark-700 hover:text-white transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            to="/my-rooms"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 
                                     hover:bg-dark-700 hover:text-white transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <MapPin className="w-4 h-4" />
                            My Rooms
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-dark-300 
                                     hover:bg-dark-700 hover:text-white transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-dark-700 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 
                                     hover:bg-red-500/10 w-full transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn-ghost text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </>
  );
};

export default Navbar;
