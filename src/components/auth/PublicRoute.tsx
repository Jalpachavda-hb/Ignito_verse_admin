import React from "react";
import { Navigate, Outlet } from "react-router";
import { isAuthenticated } from "../../services/authService";

interface PublicRouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard for public guest pages (e.g. /signin).
 * If user is already authenticated, redirects them to the admin dashboard.
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const isAuth = isAuthenticated();

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
