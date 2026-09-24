import React, { useState, useEffect } from "react";
import { subscribeToApiLoading } from "../../services/apiClient";

/**
 * TopProgressBar: Renders a sleek, slim glowing gradient progress bar at the very top of the app
 * whenever any network API request is active in apiClient.
 */
export function TopProgressBar() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToApiLoading((isLoading) => {
      setLoading(isLoading);
    });
    return unsubscribe;
  }, []);

  if (!loading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none overflow-hidden"
      role="progressbar"
      aria-label="Loading page data"
    >
      <div className="h-full w-full bg-gradient-to-r from-[#052765] via-[#3a2c8c] to-[#af4bb8] animate-pulse" />
      <div
        className="absolute top-0 bottom-0 left-0 bg-white/40 shadow-[0_0_10px_#af4bb8]"
        style={{
          width: "40%",
          animation: "ignitoTopBarSlide 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}
      />
      <style>{`
        @keyframes ignitoTopBarSlide {
          0% { transform: translateX(-100%); width: 20%; }
          50% { width: 50%; }
          100% { transform: translateX(500%); width: 30%; }
        }
      `}</style>
    </div>
  );
}

/**
 * TableLoader: Premium loader designed specifically for Table components
 * @param {Object} props
 * @param {number} [props.colSpan=6] - Number of columns to span
 * @param {string} [props.text="Loading data, please wait..."] - Informative loading message
 * @param {boolean} [props.showSkeleton=true] - Whether to show subtle placeholder shimmer rows
 */
export function TableLoader({
  colSpan = 6,
  text = "Loading data, please wait...",
  showSkeleton = true,
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-12 px-6 text-center text-theme-sm text-gray-500 dark:text-gray-400"
      >
        <div className="flex flex-col items-center justify-center gap-3">
          {/* Branded dual-ring spinning loader */}
          <div className="relative size-9">
            <div className="absolute inset-0 rounded-full border-[2.5px] border-purple-100 dark:border-purple-950/40" />
            <div className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#3a2c8c] border-r-[#af4bb8] animate-spin" />
            <div className="absolute inset-2 rounded-full border-[2px] border-transparent border-b-[#052765] animate-[spin_0.8s_linear_infinite_reverse]" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
              {text}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Fetching records from server...
            </p>
          </div>

          {/* Optional subtle shimmer bar */}
          {showSkeleton && (
            <div className="w-48 max-w-full h-1 mt-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-[#3a2c8c]/30 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * DataLoader: Standalone card / container loader
 * @param {Object} props
 * @param {string} [props.text="Loading data, please wait..."]
 * @param {string} [props.minHeight="240px"]
 */
export function DataLoader({
  text = "Loading data, please wait...",
  minHeight = "240px",
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 w-full p-8 text-center"
      style={{ minHeight }}
    >
      <div className="relative size-10">
        <div className="absolute inset-0 rounded-full border-3 border-purple-100 dark:border-purple-950/40" />
        <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#3a2c8c] border-r-[#af4bb8] animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#052765] animate-[spin_0.8s_linear_infinite_reverse]" />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
          {text}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Please wait while data is being prepared...
        </p>
      </div>
    </div>
  );
}

export default DataLoader;
