import React from "react";
import { Link } from "react-router";
import { formatImageUrl } from "../../dto/output/homepageOutputs";
import { PencilIcon, EyeIcon } from "../../icons";
import { BookOpenIcon } from "../../icons/menuIcons";

interface CourseItem {
  microcredentialCourseId?: number;
  microcredentialCourseName?: string;
  streamName?: string;
  courseLevel?: string;
  microcredentialCoursePrice?: number;
  microcredentialCourseRating?: number;
  microcredentialCourseDuration?: string;
  microcredentialCourseIntroImage?: string;
  courseStatus?: string;
}

interface RecentCoursesTableProps {
  courses: CourseItem[];
  loading: boolean;
}

export const RecentCoursesTable: React.FC<RecentCoursesTableProps> = ({
  courses,
  loading,
}) => {
  const displayCourses = courses.slice(0, 6);

  const getLevelBadgeClass = (level: string = "") => {
    const l = level.toLowerCase();
    if (l.includes("beginner")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    }
    if (l.includes("intermediate")) {
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    }
    if (l.includes("advanced") || l.includes("expert")) {
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800";
    }
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Microcredential Courses
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Latest learning courses added to the Ignito Verse platform
          </p>
        </div>

        <Link
          to="/microcredential/course-list"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
        >
          <span>View all courses</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="border-b border-gray-100 bg-gray-50/75 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3.5">Course Name</th>
              <th className="px-4 py-3.5">Stream</th>
              <th className="px-4 py-3.5">Level</th>
              <th className="px-4 py-3.5">Duration</th>
              <th className="px-4 py-3.5">Price</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
                      <div className="space-y-1">
                        <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-800"></div>
                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                  <td className="px-4 py-4"><div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-14 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                  <td className="px-4 py-4"><div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                  <td className="px-4 py-4"><div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                  <td className="px-6 py-4 text-right"><div className="ml-auto h-7 w-16 rounded bg-gray-200 dark:bg-gray-800"></div></td>
                </tr>
              ))
            ) : displayCourses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <BookOpenIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="mt-2 text-sm font-medium">No courses found</p>
                  <Link
                    to="/microcredential/course-add"
                    className="mt-2 inline-flex text-xs font-semibold text-brand-500 hover:underline"
                  >
                    + Add your first microcredential course
                  </Link>
                </td>
              </tr>
            ) : (
              displayCourses.map((course) => {
                const imgUrl = course.microcredentialCourseIntroImage
                  ? formatImageUrl(course.microcredentialCourseIntroImage)
                  : "";
                const price = course.microcredentialCoursePrice
                  ? Number(course.microcredentialCoursePrice) === 0
                    ? "Free"
                    : `₹${Number(course.microcredentialCoursePrice).toLocaleString()}`
                  : "Free";

                const isActive =
                  course.courseStatus?.toLowerCase() === "active" ||
                  course.courseStatus === "1" ||
                  !course.courseStatus;

                return (
                  <tr
                    key={course.microcredentialCourseId}
                    className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={course.microcredentialCourseName || "Course"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <BookOpenIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/microcredential/course-edit/${course.microcredentialCourseId}`}
                            className="block truncate font-medium text-gray-900 hover:text-brand-500 dark:text-white dark:hover:text-brand-400"
                            title={course.microcredentialCourseName}
                          >
                            {course.microcredentialCourseName || "Untitled Course"}
                          </Link>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ID: #{course.microcredentialCourseId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                      {course.streamName || "General"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getLevelBadgeClass(
                          course.courseLevel
                        )}`}
                      >
                        {course.courseLevel || "Standard"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                      {course.microcredentialCourseDuration || "Self-paced"}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {price}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isActive
                            ? "bg-success-50 text-success-700 dark:bg-success-950/40 dark:text-success-400"
                            : "bg-error-50 text-error-700 dark:bg-error-950/40 dark:text-error-400"
                        }`}
                      >
                        <span
                          className={`mr-1 h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-success-500" : "bg-error-500"
                          }`}
                        ></span>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/microcredential/course-modules/${course.microcredentialCourseId}`}
                          title="View Modules"
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/microcredential/course-edit/${course.microcredentialCourseId}`}
                          title="Edit Course"
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentCoursesTable;
