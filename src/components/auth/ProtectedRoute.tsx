import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { isAuthenticated } from "../../services/authService";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard for protected admin pages.
 * If user is not authenticated, redirects them to /signin and stores the previous location.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuth = isAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
