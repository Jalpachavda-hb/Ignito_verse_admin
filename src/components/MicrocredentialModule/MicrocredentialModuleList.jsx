import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table";
import {
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FolderIcon,
} from "../../icons";
import {
  adminMicrocredentialCourseList,
  logJsError,
} from "../../services/adminMicrocredentialService";

export default function MicrocredentialModuleList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Course data & loading states
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );

  // Search, Sort & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [orderByColumn, setOrderByColumn] = useState("MicrocredentialCourseId");
  const [orderByDirection, setOrderByDirection] = useState("DESC");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch Course List using adminMicrocredentialCourseList API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await adminMicrocredentialCourseList(
        currentPage,
        pageSize,
        orderByColumn,
        orderByDirection,
        0,
        1,
        debouncedSearch
      );

      if (response && response.success !== false) {
        const list =
          response.microcredentialCourseOutPutList ||
          response.MicrocredentialCourseOutPutList ||
          response.data ||
          [];
        setCourseList(Array.isArray(list) ? list : []);
        setTotalRecords(
          response.pageDetail?.totalRecords ??
          response.totalRecords ??
          list.length
        );
      } else {
        const msg = response?.message || "Failed to load course list.";
        setErrorMessage(msg);
        logJsError(msg, "", "MicrocredentialModuleList.jsx fetchCourses");
      }
    } catch (err) {
      console.error("Error in fetchCourses:", err);
      const msg = err.message || "An unexpected error occurred while fetching courses.";
      setErrorMessage(msg);
      logJsError(msg, err.stack, "MicrocredentialModuleList.jsx fetchCourses");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, orderByColumn, orderByDirection, debouncedSearch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Handle Sort
  const handleSort = (column) => {
    if (orderByColumn === column) {
      setOrderByDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setOrderByColumn(column);
      setOrderByDirection("ASC");
    }
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <PageMeta
        title="Microcredential Module List | IgnitoVerse Admin"
        description="Select a course to view, manage, and add its modules and topics."
      />
      <PageBreadcrumb pageTitle="Microcredential Module List" />

      {/* Notifications */}
      {successMessage && (
        <div className="mb-4 flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl transition-all shadow-sm">
          <div className="flex items-center gap-3">
            <AlertIcon className="size-5 text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      )}

      {/* Instruction Card */}
      <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
            ℹ
          </span>
          <div>
            <span className="font-semibold text-sm block">Course Modules Directory</span>
            <span className="text-blue-700/80 dark:text-blue-300/80">
              Click <strong>"View Modules"</strong> on any course below to open its dedicated modules page.
            </span>
          </div>
        </div>

        <Link
          to="/microcredential/module-add"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition whitespace-nowrap"
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Module</span>
        </Link>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Top Actions: Search + Entries */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search course or stream..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>

            <button
              type="button"
              onClick={fetchCourses}
              disabled={loading}
              className="ml-2 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              title="Refresh courses"
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow className="bg-gray-50/70 hover:bg-transparent dark:bg-white/[0.02]">
                <TableCell isHeader className="w-16 px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sr No
                </TableCell>
                <TableCell
                  isHeader
                  className="min-w-[200px] cursor-pointer select-none px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                  onClick={() => handleSort("StreamName")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stream</span>
                    <span className="text-gray-400">
                      {orderByColumn === "StreamName" ? (
                        orderByDirection === "ASC" ? <ChevronUpIcon className="inline size-3.5" /> : <ChevronDownIcon className="inline size-3.5" />
                      ) : (
                        "▾"
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="min-w-[280px] cursor-pointer select-none px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                  onClick={() => handleSort("MicrocredentialCourseName")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Course Name</span>
                    <span className="text-gray-400">
                      {orderByColumn === "MicrocredentialCourseName" ? (
                        orderByDirection === "ASC" ? <ChevronUpIcon className="inline size-3.5" /> : <ChevronDownIcon className="inline size-3.5" />
                      ) : (
                        "▾"
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="w-56 px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span className="text-sm">Loading courses...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : courseList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                courseList.map((item, index) => {
                  const serialNo = (currentSafePage - 1) * pageSize + index + 1;
                  const courseId = Number(
                    item.microcredentialCourseId ||
                    item.MicrocredentialCourseId ||
                    0
                  );

                  return (
                    <TableRow
                      key={courseId || index}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                    >
                      {/* 1. Sr No */}
                      <TableCell className="px-4 py-4 text-center text-sm font-medium text-gray-500">
                        {serialNo}
                      </TableCell>

                      {/* 2. Stream Name */}
                      <TableCell className="px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="inline-block rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                          {item.streamName || "General"}
                        </span>
                      </TableCell>

                      {/* 3. Course Name */}
                      <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {item.microcredentialCourseName || `Course #${courseId}`}
                        </div>
                        {item.courseLevel && (
                          <span className="text-[11px] text-gray-400">
                            {item.courseLevel}
                          </span>
                        )}
                      </TableCell>

                      {/* 4. Actions: View Modules & Edit Course */}
                      <TableCell className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Modules Button (Opens dedicated new page) */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/microcredential/course-modules/${courseId}`, {
                                state: {
                                  courseId,
                                  courseName: item.microcredentialCourseName,
                                  streamName: item.streamName,
                                  streamId: item.microcredentialCourseStreamId || item.streamId,
                                  item,
                                },
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs hover:border-blue-300 hover:bg-blue-100 active:scale-95 transition dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
                            title="View Modules for this Course"
                          >
                            <FolderIcon className="size-3.5 text-blue-600 dark:text-blue-400" />
                            <span>View Modules</span>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Pagination */}
        {courseList.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(currentSafePage - 1) * pageSize + 1} to{" "}
              {Math.min(currentSafePage * pageSize, totalRecords)} of {totalRecords} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentSafePage === 1}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                Page {currentSafePage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentSafePage === totalPages}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
