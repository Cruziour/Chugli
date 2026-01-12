// src/components/auth/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAuth } from "@/features/auth/authSlice";
import { PageLoader } from "@/components/common/Loader";

const ProtectedRoute = ({ redirectTo = "/login" }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isInitialized, isLoading } = useSelector(selectAuth);

  // Show loader while checking auth
  if (!isInitialized || isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
