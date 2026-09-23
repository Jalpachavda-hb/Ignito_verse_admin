import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import {
  CheckCircleIcon,
  AlertIcon,
  AlertHexaIcon,
  InfoIcon,
  CloseIcon,
} from "../icons";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global trigger support for non-React contexts
let globalToastHandler: ((msg: string, type?: ToastType, duration?: number) => void) | null = null;

export const toast = {
  show: (msg: string, type: ToastType = "info", duration = 4000) => {
    if (globalToastHandler) globalToastHandler(msg, type, duration);
  },
  success: (msg: string, duration = 4000) => {
    if (globalToastHandler) globalToastHandler(msg, "success", duration);
  },
  error: (msg: string, duration = 4000) => {
    if (globalToastHandler) globalToastHandler(msg, "error", duration);
  },
  warning: (msg: string, duration = 4000) => {
    if (globalToastHandler) globalToastHandler(msg, "warning", duration);
  },
  info: (msg: string, duration = 4000) => {
    if (globalToastHandler) globalToastHandler(msg, "info", duration);
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration: number = 4000) => {
      if (!message || typeof message !== "string") return;
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newItem: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev.slice(-4), newItem]); // Keep at most 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Link global toast handler
  React.useEffect(() => {
    globalToastHandler = showToast;
    return () => {
      globalToastHandler = null;
    };
  }, [showToast]);

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, "success", duration),
    [showToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast(message, "error", duration),
    [showToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, "warning", duration),
    [showToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast(message, "info", duration),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info,
      removeToast,
    }),
    [showToast, success, error, warning, info, removeToast]
  );

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="size-5 shrink-0 text-emerald-400" />;
      case "error":
        return <AlertIcon className="size-5 shrink-0 text-rose-400" />;
      case "warning":
        return <AlertHexaIcon className="size-5 shrink-0 text-amber-400" />;
      case "info":
      default:
        return <InfoIcon className="size-5 shrink-0 text-blue-400" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/40 border-l-emerald-500";
      case "error":
        return "border-rose-500/40 border-l-rose-500";
      case "warning":
        return "border-amber-500/40 border-l-amber-500";
      case "info":
      default:
        return "border-blue-500/40 border-l-blue-500";
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Floating Toast Notification Container */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-3rem)] pointer-events-none transition-all duration-300"
        >
          {toasts.map((item) => (
            <div
              key={item.id}
              role="alert"
              className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border border-l-4 bg-gray-900/95 dark:bg-gray-950/95 p-3.5 text-white shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 ${getBorderColor(
                item.type
              )}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="mt-0.5">{getToastIcon(item.type)}</span>
                <p className="text-xs sm:text-sm font-medium leading-relaxed break-words text-gray-100">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition shrink-0 ml-1"
                aria-label="Close notification"
              >
                <CloseIcon className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside ToastProvider
    return {
      showToast: (msg: string, type: ToastType = "info") => {
        console.log(`[Toast (${type})]:`, msg);
      },
      success: (msg: string) => console.log("[Toast (success)]:", msg),
      error: (msg: string) => console.error("[Toast (error)]:", msg),
      warning: (msg: string) => console.warn("[Toast (warning)]:", msg),
      info: (msg: string) => console.info("[Toast (info)]:", msg),
      removeToast: () => {},
    };
  }
  return context;
};
