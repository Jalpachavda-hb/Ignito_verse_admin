import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  isSessionExpired,
  getSessionRemainingTime,
  clearAuthSession,
  isAuthenticated
} from "../../services/sessionManager";

/**
 * SessionTimeoutManager monitors the 2-hour admin session lifecycle.
 * Automatically clears local credentials and forces navigation to /signin
 * once 2 hours have elapsed.
 */
export default function SessionTimeoutManager() {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleSessionExpire() {
      clearAuthSession();
      navigate("/signin?expired=true", {
        replace: true,
        state: { sessionExpired: true }
      });
    }

    function checkAndSchedule() {
      // If not authenticated at all, nothing to monitor
      if (!isAuthenticated()) {
        return;
      }

      // Check if session has exceeded 2 hours
      if (isSessionExpired()) {
        handleSessionExpire();
        return;
      }

      // Calculate remaining milliseconds
      const remainingMs = getSessionRemainingTime();
      if (remainingMs <= 0) {
        handleSessionExpire();
        return;
      }

      // Clear existing scheduled timer if any
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Schedule auto-logout when remaining time expires
      timerRef.current = setTimeout(() => {
        handleSessionExpire();
      }, remainingMs);
    }

    // Initial check and schedule
    checkAndSchedule();

    // Listen for tab focus/visibility changes (e.g., waking laptop or switching tabs)
    function onVisibilityOrFocus() {
      if (document.visibilityState === "visible") {
        checkAndSchedule();
      }
    }

    // Periodic safety check every 15 seconds (detects system sleep / background timer throttling)
    const intervalId = setInterval(() => {
      if (isAuthenticated()) {
        if (isSessionExpired()) {
          handleSessionExpire();
        }
      }
    }, 15000);

    // Cross-tab and local session change synchronization
    function onStorageOrSessionChange(e: StorageEvent | Event) {
      if ("key" in e) {
        // If an auth storage key was modified or cleared in another tab
        if (!e.key || e.key.startsWith("ignito_")) {
          checkAndSchedule();
        }
      } else {
        checkAndSchedule();
      }
    }

    window.addEventListener("visibilitychange", onVisibilityOrFocus);
    window.addEventListener("focus", onVisibilityOrFocus);
    window.addEventListener("storage", onStorageOrSessionChange);
    window.addEventListener("ignito_session_change", onStorageOrSessionChange);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", onVisibilityOrFocus);
      window.removeEventListener("focus", onVisibilityOrFocus);
      window.removeEventListener("storage", onStorageOrSessionChange);
      window.removeEventListener("ignito_session_change", onStorageOrSessionChange);
    };
  }, [navigate]);

  return null;
}
