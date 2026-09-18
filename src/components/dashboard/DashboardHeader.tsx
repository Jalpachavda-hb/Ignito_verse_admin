import React from "react";
import { Link } from "react-router";
import { BookOpenIcon } from "../../icons/menuIcons";

interface DashboardHeaderProps {
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
  adminName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdated,
  loading,
  onRefresh,
  adminName = "Administrator",
}) => {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Just now";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Welcome back, <span className="text-brand-500 dark:text-brand-400">{adminName}</span>
          </h1>
          <span className="inline-flex items-center rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-950/40 dark:text-success-400">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse"></span>
            Live Portal
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ignito Verse platform real-time analytics, course management, quizzes, and live sessions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Updated: <span className="font-medium text-gray-700 dark:text-gray-300">{formattedTime}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 dark:hover:text-white"
          title="Refresh real-time data from APIs"
        >
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${
              loading ? "animate-spin text-brand-500" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{loading ? "Refreshing..." : "Refresh"}</span>
        </button>

        <Link
          to="/microcredential/course-add"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <BookOpenIcon className="h-4 w-4" />
          <span>New Course</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
