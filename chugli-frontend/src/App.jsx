// src/App.jsx (Final Version)

import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Layout
import Layout from "@/components/layout/Layout";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOTP from "@/pages/auth/VerifyOTP";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Protected Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import MyRooms from "@/pages/dashboard/MyRooms";
import SearchPage from "@/pages/dashboard/SearchPage";
import ChatPage from "@/pages/chat/ChatPage";
import Profile from "@/pages/profile/Profile";
import Settings from "@/pages/profile/Settings";

// Components
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import GlobalLoading from "@/components/common/GlobalLoading";
import ToastConfig from "@/components/common/ToastConfig";
import { PageLoader } from "@/components/common/Loader";

// 404 Page
import NotFound from "@/pages/NotFound";

// Redux
import { getMe, setInitialized, selectAuth } from "@/features/auth/authSlice";

// Socket Service
import socketService from "@/services/socket";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized, accessToken } =
    useSelector(selectAuth);

  // Initialize auth and socket on mount
  useEffect(() => {
    const initializeApp = async () => {
      if (accessToken && !isInitialized) {
        try {
          await dispatch(getMe()).unwrap();
          socketService.connect();
        } catch (error) {
          console.error("Failed to initialize:", error);
        } finally {
          dispatch(setInitialized());
        }
      } else {
        dispatch(setInitialized());
      }
    };

    initializeApp();
  }, [dispatch, accessToken, isInitialized]);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      socketService.connect();
    } else if (!isAuthenticated) {
      socketService.disconnect();
    }
  }, [isAuthenticated, isInitialized]);

  // Show loader while initializing
  if (!isInitialized) {
    return <PageLoader message="Starting Chugli..." />;
  }

  return (
    <>
      {/* Global Loading Overlay */}
      <GlobalLoading />

      {/* Routes */}
      <Routes>
        {/* ============== Public Routes ============== */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* ============== Protected Routes ============== */}
        <Route element={<ProtectedRoute />}>
          {/* Routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-rooms" element={<MyRooms />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Chat Page (Full Screen - No Layout) */}
          <Route path="/chat/:roomId" element={<ChatPage />} />
        </Route>

        {/* ============== 404 Page ============== */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notifications */}
      <ToastConfig />
    </>
  );
}

export default App;
