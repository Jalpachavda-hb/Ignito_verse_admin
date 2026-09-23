import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { isAuthenticated, isSessionExpired } from "../../services/authService";
import SessionTimeoutManager from "./SessionTimeoutManager";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Route guard for protected admin pages.
 * Enforces authentication and the 2-hour session timeout rule.
 * If user is not authenticated or session expired, redirects to /signin.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const expired = isSessionExpired();
  const isAuth = isAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to={expired ? "/signin?expired=true" : "/signin"}
        state={{ from: location, sessionExpired: expired }}
        replace
      />
    );
  }

  return (
    <>
      <SessionTimeoutManager />
      {children ? <>{children}</> : <Outlet />}
    </>
  );
}
