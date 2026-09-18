import React from "react";
import { Link } from "react-router";
import { MedalAwardIcon, TrendingUpIcon } from "../../icons/menuIcons";

interface QuizResultItem {
  studentId?: number;
  quizId?: number;
  studentName?: string;
  email?: string;
  quizTitle?: string;
  quizDescription?: string;
  microcredentialCourseName?: string;
  streamName?: string;
}

interface RecentQuizSubmissionsTableProps {
  quizResults: QuizResultItem[];
  loading: boolean;
}

export const RecentQuizSubmissionsTable: React.FC<RecentQuizSubmissionsTableProps> = ({
  quizResults,
  loading,
}) => {
  const displayResults = quizResults.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Student Quiz Submissions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Latest student evaluation attempts across courses
          </p>
        </div>

        <Link
          to="/microcredential/quiz-result"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          <span>View all results</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-4 py-3.5">Quiz Title</th>
              <th className="px-4 py-3.5">Course / Stream</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                      <div className="space-y-1">
                        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800"></div>
                        <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                  <td className="px-6 py-4 text-right"><div className="ml-auto h-7 w-20 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                </tr>
              ))
            ) : displayResults.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <MedalAwardIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="mt-2 text-sm font-medium">No quiz attempts recorded yet</p>
                  <p className="text-xs text-gray-400">
                    When students take course quizzes, attempts will appear here automatically.
                  </p>
                </td>
              </tr>
            ) : (
              displayResults.map((item, idx) => (
                <tr
                  key={`${item.studentId}-${item.quizId}-${idx}`}
                  className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        {item.studentName ? item.studentName.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900 dark:text-white">
                          {item.studentName || "Anonymous Student"}
                        </p>
                        <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                          {item.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                    <span className="line-clamp-1">{item.quizTitle || `Quiz #${item.quizId}`}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                    <span className="block font-medium text-gray-700 dark:text-gray-300">
                      {item.microcredentialCourseName || "Microcredential Course"}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">{item.streamName || "Stream"}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      to="/microcredential/quiz-result"
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-gray-750"
                    >
                      <TrendingUpIcon className="h-3.5 w-3.5" />
                      <span>Result</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentQuizSubmissionsTable;
