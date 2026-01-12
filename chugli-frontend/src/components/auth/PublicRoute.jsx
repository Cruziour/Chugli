// src/components/auth/PublicRoute.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectAuth } from "@/features/auth/authSlice";
import { PageLoader } from "@/components/common/Loader";

const PublicRoute = ({ redirectTo = "/dashboard" }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isInitialized } = useSelector(selectAuth);

  // Show loader while checking auth
  if (!isInitialized) {
    return <PageLoader message="Loading..." />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    // Check if there's a previous location to go back to
    const from = location.state?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
