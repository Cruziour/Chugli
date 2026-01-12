// src/hooks/useAuth.js

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectAuth,
  selectIsAuthenticated,
  selectUser,
  getMe,
  logout,
  setInitialized,
} from "@/features/auth/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      if (auth.accessToken && !auth.isInitialized) {
        try {
          await dispatch(getMe()).unwrap();
        } catch (error) {
          console.error("Failed to initialize auth:", error);
        } finally {
          dispatch(setInitialized());
        }
      } else if (!auth.accessToken) {
        dispatch(setInitialized());
      }
    };

    initAuth();
  }, [dispatch, auth.accessToken, auth.isInitialized]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate to login
      navigate("/login");
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: auth.isLoading,
    isInitialized: auth.isInitialized,
    error: auth.error,
    logout: handleLogout,
  };
};

export default useAuth;
