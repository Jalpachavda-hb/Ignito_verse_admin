import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  TrashBinIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  EyeIcon,
  PencilIcon,
  DownloadIcon,
  FileIcon,
  VideoIcon,
} from "../../icons";
import {
  microCourseTopicList,
  microCourseTopicDelete,
  getMicrocredentialStudentDownloadDocuments,
  downloadFileFromUrl,
  getMicrocredentialTopicByModuleId,
  getMicrocredentialModuleByCourseId,
} from "../../services/adminMicrocredentialService";
import { getMicroCourseTopicDetail } from "../../services/microcredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function MicrocredentialTopicList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data & loading states
  const [coursesWithTopics, setCoursesWithTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );
  const [downloadingUrl, setDownloadingUrl] = useState("");

  const handleDownload = async (url, defaultName = "document.pdf") => {
    if (!url) return;
    setDownloadingUrl(url);
    try {
      await downloadFileFromUrl(url, defaultName);
    } catch (err) {
      console.error("Failed to download file:", err);
    } finally {
      setDownloadingUrl("");
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStream, setSelectedStream] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "updatedOn",
    direction: "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals state
  // 1. Topic View Modal
  const [topicModalCourse, setTopicModalCourse] = useState(null);
  const [topicModalLoading, setTopicModalLoading] = useState(false);
  const [topicList, setTopicList] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [courseModules, setCourseModules] = useState([]);

  // Active module name for topic modal
  const currentActiveModuleName = useMemo(() => {
    if (!topicModalCourse) return "";
    if (selectedModuleId && courseModules.length > 0) {
      const found = courseModules.find(
        (m) => (m.microcredentialModuleMasterId || m.id) === selectedModuleId
      );
      if (found && found.moduleName) return found.moduleName;
    }
    return topicModalCourse.moduleName || "";
  }, [topicModalCourse, selectedModuleId, courseModules]);

  // 2. Microcredential Document View Modal
  const [documentModalCourse, setDocumentModalCourse] = useState(null);

  // 3. Student Download Document View Modal
  const [studentDocModalCourse, setStudentDocModalCourse] = useState(null);
  const [studentDocLoading, setStudentDocLoading] = useState(false);
  const [studentDocList, setStudentDocList] = useState([]);

  // 4. Delete Confirmation Modal
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 5. Watch Video Modal
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Close active video modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeVideoModal) {
        setActiveVideoModal(null);
      }
    };
    if (activeVideoModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeVideoModal]);

  /**
   * Fetches topic courses from backend API using microCourseTopicList with adminId: 1
   */
  const fetchTopicList = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await microCourseTopicList(
        currentPage,
        pageSize,
        "MicrocredentialCourseId",
        "DESC",
        0,
        1,
        searchQuery.trim()
      );

      if (response && response.success !== false) {
        const list =
          response.microCourseTopicList ||
          response.MicroCourseTopicList ||
          response.data ||
          [];

        setCoursesWithTopics(Array.isArray(list) ? list : []);
        setTotalRecords(
          response.pageDetail?.totalRecords ||
          response.totalRecords ||
          list.length
        );
      } else {
        setErrorMessage(
          response?.message ||
          response?.errorDescription ||
          "Failed to load microcredential topic list."
        );
        setCoursesWithTopics([]);
      }
    } catch (err) {
      console.error("Error fetching micro course topic list:", err);
      setErrorMessage(err.message || "Failed to load micro course topic list.");
      setCoursesWithTopics([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchTopicList();
  }, [fetchTopicList]);

  // Unique streams for filter dropdown
  const availableStreams = useMemo(() => {
    const streams = new Set();
    coursesWithTopics.forEach((item) => {
      if (item.streamName && item.streamName.trim()) {
        streams.add(item.streamName.trim());
      }
    });
    return Array.from(streams);
  }, [coursesWithTopics]);

  // Filter & Sort
  const processedList = useMemo(() => {
    let result = [...coursesWithTopics];

    if (selectedStream !== "all") {
      result = result.filter(
        (item) => (item.streamName || "").toLowerCase() === selectedStream.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = (item.microcredentialCourseName || "").toLowerCase();
        const stream = (item.streamName || "").toLowerCase();
        return name.includes(q) || stream.includes(q);
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key] ?? "";
        let valB = b[sortConfig.key] ?? "";

        if (sortConfig.key === "updatedOn") {
          const dateA = new Date(valA).getTime() || 0;
          const dateB = new Date(valB).getTime() || 0;
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
        if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [coursesWithTopics, selectedStream, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const totalItems = processedList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return processedList.slice(start, start + pageSize);
  }, [processedList, currentSafePage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentSafePage - 1) * pageSize + 1;
  const endIndex = Math.min(currentSafePage * pageSize, totalItems);

  // ===========================================================================
  // MODAL HANDLERS
  // ===========================================================================

  // 1. Open Topics Modal (Calls GetMicrocredentialTopicByModuleId with microcredentialModuleMasterId)
  const handleOpenTopics = async (course) => {
    setTopicModalCourse(course);
    setTopicModalLoading(true);
    setTopicList([]);
    setCourseModules([]);

    const moduleId = Number(
      course.microcredentialModuleMasterId || course.MicrocredentialModuleMasterId || 0
    );
    const courseId = Number(
      course.microcredentialCourseId || course.MicrocredentialCourseId || 0
    );

    setSelectedModuleId(moduleId > 0 ? moduleId : null);

    try {
      // Fetch modules for this course to display module tabs / selector
      let modules = [];
      if (courseId > 0) {
        try {
          const modRes = await getMicrocredentialModuleByCourseId(courseId);
          if (modRes && modRes.success && Array.isArray(modRes.microcredentialModuleList)) {
            modules = modRes.microcredentialModuleList;
            setCourseModules(modules);
          }
        } catch (e) {
          console.warn("Could not load course modules:", e);
        }
      }

      // Determine which module ID to query (prefer the row's moduleId)
      const targetModuleId = moduleId > 0 ? moduleId : (modules.length > 0 ? modules[0].microcredentialModuleMasterId : 0);
      setSelectedModuleId(targetModuleId > 0 ? targetModuleId : null);

      if (targetModuleId > 0) {
        // Call GetMicrocredentialTopicByModuleId API with payload { microcredentialModuleMasterId: targetModuleId }
        const res = await getMicrocredentialTopicByModuleId(targetModuleId);
        if (res && res.success && Array.isArray(res.microcredentialTopicList) && res.microcredentialTopicList.length > 0) {
          setTopicList(res.microcredentialTopicList);
        } else if (courseId > 0) {
          // Fallback if module-specific list is empty
          const fallbackRes = await getMicroCourseTopicDetail(courseId, 0);
          if (fallbackRes && fallbackRes.success) {
            const list =
              fallbackRes.getMicroCourseTopicDetailList ||
              fallbackRes.microCourseTopicDetailList ||
              fallbackRes.topicList ||
              [];
            setTopicList(Array.isArray(list) ? list : []);
          }
        }
      } else if (courseId > 0) {
        const res = await getMicroCourseTopicDetail(courseId, 0);
        if (res && res.success) {
          const list =
            res.getMicroCourseTopicDetailList ||
            res.microCourseTopicDetailList ||
            res.topicList ||
            [];
          setTopicList(Array.isArray(list) ? list : []);
        }
      }
    } catch (err) {
      console.warn("Could not load course topics detail:", err);
    } finally {
      setTopicModalLoading(false);
    }
  };

  // Switch active module in modal to show topics for the selected module
  const handleSelectModule = async (newModuleId) => {
    if (!newModuleId || newModuleId === selectedModuleId) return;
    setSelectedModuleId(newModuleId);
    setTopicModalLoading(true);

    try {
      const res = await getMicrocredentialTopicByModuleId(newModuleId);
      if (res && res.success && Array.isArray(res.microcredentialTopicList)) {
        setTopicList(res.microcredentialTopicList);
      } else {
        setTopicList([]);
      }
    } catch (err) {
      console.error("Error switching module topics:", err);
      setTopicList([]);
    } finally {
      setTopicModalLoading(false);
    }
  };

  // 2. Open Microcredential Document Modal
  const handleOpenDocument = (course) => {
    setDocumentModalCourse(course);
  };

  // 3. Open Student Download Documents Modal
  const handleOpenStudentDocs = async (course) => {
    setStudentDocModalCourse(course);
    setStudentDocLoading(true);
    setStudentDocList([]);

    const id = Number(
      course.microcredentialCourseId || course.MicrocredentialCourseId || 0
    );

    if (id > 0) {
      try {
        const res = await getMicrocredentialStudentDownloadDocuments(id);
        if (res && res.success) {
          const list =
            res.adminGetMicrocredentialStudentDownloadDocumentsData ||
            res.microcredentialStudentDownloadDocumentList ||
            [];
          setStudentDocList(Array.isArray(list) ? list : []);
        } else {
          // Fallback to getMicroCourseTopicDetail
          const topicDetailRes = await getMicroCourseTopicDetail(id, 0);
          if (topicDetailRes && topicDetailRes.success) {
            const list =
              topicDetailRes.microcredentialStudentDownloadDocumentList || [];
            setStudentDocList(Array.isArray(list) ? list : []);
          }
        }
      } catch (err) {
        console.warn("Could not load student download documents:", err);
      } finally {
        setStudentDocLoading(false);
      }
    } else {
      setStudentDocLoading(false);
    }
  };

  // 4. Delete Confirmation Handler
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;

    const courseId = Number(
      deleteModalItem.microcredentialCourseId ||
      deleteModalItem.MicrocredentialCourseId ||
      0
    );

    setDeleting(true);
    try {
      const res = await microCourseTopicDelete(courseId, 1);
      if (res && res.success !== false) {
        setSuccessMessage(res.message || "Micro course topics deleted successfully.");
        setCoursesWithTopics((prev) =>
          prev.filter(
            (c) =>
              Number(c.microcredentialCourseId || c.MicrocredentialCourseId) !== courseId
          )
        );
      } else {
        setErrorMessage(
          res?.message || res?.errorDescription || "Failed to delete topics for course."
        );
      }
    } catch (err) {
      console.error("Error deleting topics:", err);
      setErrorMessage(err.message || "Failed to delete micro course topics.");
    } finally {
      setDeleting(false);
      setDeleteModalItem(null);
    }
  };

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
    <div className="w-full pb-14">
      <PageMeta
        title="Microcredential Topic List | IgnitoVerse Admin"
        description="View and manage video topics, curriculum PDFs, and downloadable student resources."
      />

      <PageBreadcrumb pageTitle="Microcredential Topic List" />

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircleIcon className="size-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="flex-1 font-semibold">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertIcon className="size-4.5 shrink-0 text-red-600 dark:text-red-400" />
          <span className="flex-1 font-semibold">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="rounded-lg p-1 text-red-600 hover:bg-red-100"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        {/* Row 1: Top Action Buttons aligned to the right */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-gray-100 p-5 dark:border-white/[0.05]">
          <Link
            to="/microcredential/course-list"
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:border-blue-300 hover:bg-blue-100 active:scale-95 transition dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
          >
            <svg
              className="size-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span>Manage Courses</span>
          </Link>

          <Link
            to="/microcredential/topic-add"
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/90 px-4 py-2 text-xs font-semibold text-red-700 shadow-xs hover:border-red-300 hover:bg-red-100 active:scale-95 transition dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ Add Topic</span>
          </Link>
        </div>

        {/* Row 2: Search Box & Stream Filter */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          {/* Stream Filter & Refresh */}
          <div className="flex flex-wrap items-center gap-3">
            {availableStreams.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>Stream:</span>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="all">All Streams</option>
                  {availableStreams.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchTopicList}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              <span>{loading ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {/* Search Box on Right */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course or stream..."
              className="w-full rounded-lg border border-gray-300 bg-transparent py-1.5 pl-9 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
            <svg
              className="absolute left-3 top-2 size-3.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* DataTable */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow className="bg-gray-50/75 dark:bg-white/[0.02]">
                {/* 1. Sr No */}
                <TableCell
                  isHeader
                  className="w-14 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Sr No
                </TableCell>

                {/* 2. Stream Name */}
                <TableCell
                  isHeader
                  className="min-w-[180px] cursor-pointer px-4 py-3.5 text-start text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("streamName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Stream Name</span>
                    {sortConfig.key === "streamName" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 3. Microcredential Course */}
                <TableCell
                  isHeader
                  className="min-w-[240px] cursor-pointer px-4 py-3.5 text-start text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("microcredentialCourseName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Microcredential Course</span>
                    {sortConfig.key === "microcredentialCourseName" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 4. Topic (View button to show topics) */}
                <TableCell
                  isHeader
                  className="w-24 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Topic
                </TableCell>

                {/* 5. Microcredential Document (View button) */}
                <TableCell
                  isHeader
                  className="w-44 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Microcredential Document
                </TableCell>

                {/* 6. Student Download Document (View button) */}
                <TableCell
                  isHeader
                  className="w-44 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Student Download Document
                </TableCell>

                {/* 7. Updated Date */}
                <TableCell
                  isHeader
                  className="w-32 cursor-pointer px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("updatedOn")}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Updated Date</span>
                    {sortConfig.key === "updatedOn" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 8. Action */}
                <TableCell
                  isHeader
                  className="w-24 px-4 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && coursesWithTopics.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-14 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span>Loading microcredential topic list...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-14 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <FileIcon className="size-6 text-gray-400" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {searchQuery ? "No matching topics found" : "No microcredential topics found"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {searchQuery
                          ? "Try adjusting your search query or filters"
                          : "Topics will appear here once configured."}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const serialNo = (currentSafePage - 1) * pageSize + index + 1;

                  return (
                    <TableRow
                      key={item.microcredentialCourseId || index}
                      className="hover:bg-gray-50/75 dark:hover:bg-white/[0.02]"
                    >
                      {/* 1. Sr No */}
                      <TableCell className="px-3 py-4 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                        {serialNo}
                      </TableCell>

                      {/* 2. Stream Name */}
                      <TableCell className="px-4 py-4">
                        <span className="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {item.streamName || "General"}
                        </span>
                      </TableCell>

                      {/* 3. Microcredential Course */}
                      <TableCell className="px-4 py-4">
                        <h4
                          className="font-semibold text-theme-sm text-gray-900 dark:text-white line-clamp-2"
                          title={item.microcredentialCourseName}
                        >
                          {item.microcredentialCourseName || "Untitled Course"}
                        </h4>
                        {item.moduleName && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                              Module: {item.moduleName}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* 4. Topic (Blue circular eye view button) */}
                      <TableCell className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenTopics(item)}
                          className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                          title="View Course Topics"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>

                      {/* 5. Microcredential Document (Blue circular eye view button) */}
                      <TableCell className="px-3 py-4 text-center">
                        {item.uploadMicroDocument ? (
                          <button
                            type="button"
                            onClick={() => handleOpenDocument(item)}
                            className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                            title="View Microcredential Document"
                          >
                            <EyeIcon className="size-3.5 fill-white text-white" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </TableCell>

                      {/* 6. Student Download Document (Blue circular eye view button) */}
                      <TableCell className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenStudentDocs(item)}
                          className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                          title="View Student Download Documents"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>

                      {/* 7. Updated Date */}
                      <TableCell className="px-3 py-4 text-center text-theme-xs text-gray-600 dark:text-gray-400">
                        {formatDateTime(item.updatedOn)}
                      </TableCell>

                      {/* 8. Action (Red Edit Pencil + Dark Delete Trash buttons) */}
                      <TableCell className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const courseId = Number(
                                item.microcredentialCourseId ||
                                item.MicrocredentialCourseId ||
                                item.id ||
                                0
                              );
                              navigate(`/microcredential/topic-edit/${courseId}`, {
                                state: { item, courseId }
                              });
                            }}
                            className="inline-flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all"
                            title="Edit Topics"
                          >
                            <PencilIcon className="size-3.5 fill-white text-white" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalItem(item)}
                            className="inline-flex size-7 items-center justify-center rounded-full bg-gray-800 text-white shadow-xs hover:bg-black active:scale-95 transition-all dark:bg-gray-700 dark:hover:bg-gray-600"
                            title="Delete Topics"
                          >
                            <TrashBinIcon className="size-3.5 fill-white text-white" />
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

        {/* Footer Bar: Show entries, Total count, and Pagination */}
        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          {/* Left: Show entries & Total count */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {startIndex}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {endIndex}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {totalItems}
              </span>{" "}
              entries
            </div>
          </div>

          {/* Right: Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentSafePage === 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentSafePage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && (
                          <span className="px-1 text-xs text-gray-400">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`size-7 rounded-lg text-xs font-semibold transition ${
                            currentSafePage === page
                              ? "bg-brand-500 text-white shadow-xs"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentSafePage === totalPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. TOPIC DETAILS MODAL (when clicking Topic View Button) */}
      {/* ===================================================================== */}
      {topicModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {topicModalCourse.streamName || "Stream"}
                  </span>
                  {currentActiveModuleName && (
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                      Module: {currentActiveModuleName}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  Topics List
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {topicModalCourse.microcredentialCourseName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTopicModalCourse(null);
                  setTopicList([]);
                  setCourseModules([]);
                  setSelectedModuleId(null);
                  setActiveVideoModal(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            {/* Module-wise Tabs Selection (if course has multiple modules) */}
            {courseModules.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto border-b border-gray-100 pb-2.5 dark:border-gray-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 shrink-0">
                  Modules:
                </span>
                {courseModules.map((mod) => {
                  const modId = mod.microcredentialModuleMasterId || mod.id;
                  const isSelected = selectedModuleId === modId;
                  return (
                    <button
                      key={modId}
                      type="button"
                      onClick={() => handleSelectModule(modId)}
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                        isSelected
                          ? "bg-brand-500 text-white shadow-xs"
                          : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      {mod.moduleName || `Module ${modId}`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Topic List Content */}
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
              {topicModalLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <span className="text-xs text-gray-400">Loading module topics...</span>
                </div>
              ) : topicList.length > 0 ? (
                <div className="space-y-3">
                  {topicList.map((topic, idx) => {
                    const title =
                      topic.topicName ||
                      topic.microcredentialTopicName ||
                      topic.videoTitle ||
                      topic.topicTitle ||
                      `Topic #${idx + 1}`;
                    const videoUrl =
                      topic.topicVideoUrl || topic.videoURL || topic.watchVideoURL || topic.videoUrl || "";
                    const timing =
                      topic.videoStartTime || topic.videoEndTime
                        ? `${topic.videoStartTime || "0:00"} - ${topic.videoEndTime || ""}`
                        : (topic.duration || topic.topicDuration || topic.videoDuration || "");
                    const docPath =
                      topic.topicPdf || topic.topicDocument || topic.topicPDF || topic.document || "";

                    return (
                      <div
                        key={topic.microCourseTopicId || idx}
                        className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                              {idx + 1}
                            </span>
                            <h4 className="font-semibold text-xs text-gray-900 dark:text-white">
                              {title}
                            </h4>
                          </div>

                          {timing && (
                            <span className="shrink-0 rounded-md bg-gray-200/70 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              ⏱ {timing}
                            </span>
                          )}
                        </div>

                        {topic.description && (
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 pl-8 leading-relaxed">
                            {topic.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2 pl-8 text-xs">
                          {videoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveVideoModal({
                                  title,
                                  url: videoUrl,
                                  timing,
                                  topicName: topic.topicName,
                                  moduleName: currentActiveModuleName,
                                  courseName:
                                    topicModalCourse?.microcredentialCourseName || "",
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 active:scale-95 transition cursor-pointer dark:bg-blue-950/40 dark:text-blue-300"
                            >
                              <span>▶ Watch Video</span>
                            </button>
                          )}

                          {docPath && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  formatImageUrl(docPath),
                                  docPath.split("/").pop()
                                )
                              }
                              disabled={downloadingUrl === formatImageUrl(docPath)}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer disabled:opacity-50"
                            >
                              {downloadingUrl === formatImageUrl(docPath) ? (
                                <span className="inline-block size-3 animate-spin rounded-full border border-emerald-600 border-t-transparent" />
                              ) : (
                                <DownloadIcon className="size-3" />
                              )}
                              <span>Download PDF</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                    <FileIcon className="size-6" />
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    No topics found for this module.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Topics can be added during module content setup.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setTopicModalCourse(null);
                  setTopicList([]);
                  setCourseModules([]);
                  setSelectedModuleId(null);
                  setActiveVideoModal(null);
                }}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. MICROCREDENTIAL DOCUMENT MODAL */}
      {/* ===================================================================== */}
      {documentModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Microcredential Document
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {documentModalCourse.microcredentialCourseName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDocumentModalCourse(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4">
              {documentModalCourse.uploadMicroDocument ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shrink-0">
                      <FileIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                        {documentModalCourse.uploadMicroDocument.split("/").pop() || "Document"}
                      </p>
                      <p className="font-mono text-[11px] text-gray-400 truncate">
                        {documentModalCourse.uploadMicroDocument}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={formatImageUrl(documentModalCourse.uploadMicroDocument)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <span>Preview in Tab</span>
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          formatImageUrl(documentModalCourse.uploadMicroDocument),
                          documentModalCourse.uploadMicroDocument.split("/").pop()
                        )
                      }
                      disabled={
                        downloadingUrl ===
                        formatImageUrl(documentModalCourse.uploadMicroDocument)
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition cursor-pointer disabled:opacity-50"
                    >
                      {downloadingUrl ===
                      formatImageUrl(documentModalCourse.uploadMicroDocument) ? (
                        <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <DownloadIcon className="size-3.5" />
                      )}
                      <span>Download File</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 italic">
                  No microcredential document attached for this course.
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setDocumentModalCourse(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. STUDENT DOWNLOAD DOCUMENTS MODAL */}
      {/* ===================================================================== */}
      {studentDocModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Student Download Documents
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {studentDocModalCourse.microcredentialCourseName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStudentDocModalCourse(null);
                  setStudentDocList([]);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4 max-h-[50vh] overflow-y-auto pr-1">
              {studentDocLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <span className="text-xs text-gray-400">Loading student documents...</span>
                </div>
              ) : studentDocList.length > 0 ? (
                <div className="space-y-2.5">
                  {studentDocList.map((doc, idx) => {
                    const docPath =
                      doc.microcredentialStudentDownloadDocument ||
                      doc.documentPath ||
                      doc.filePath ||
                      "";
                    const fileName =
                      doc.originalFileName ||
                      doc.fileName ||
                      docPath.split("/").pop() ||
                      `Document #${idx + 1}`;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/75 p-3 dark:border-gray-700 dark:bg-gray-800/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                            <FileIcon className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-gray-800 dark:text-gray-200 truncate">
                              {fileName}
                            </p>
                            {docPath && (
                              <p className="font-mono text-[10px] text-gray-400 truncate">
                                {docPath}
                              </p>
                            )}
                          </div>
                        </div>

                        {docPath && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                formatImageUrl(docPath),
                                fileName || docPath.split("/").pop()
                              )
                            }
                            disabled={downloadingUrl === formatImageUrl(docPath)}
                            className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition cursor-pointer disabled:opacity-50"
                          >
                            {downloadingUrl === formatImageUrl(docPath) ? (
                              <span className="inline-block size-3 animate-spin rounded-full border border-white border-t-transparent" />
                            ) : (
                              <DownloadIcon className="size-3" />
                            )}
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 italic">
                  No downloadable student documents found for this course.
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setStudentDocModalCourse(null);
                  setStudentDocList([]);
                }}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. DELETE CONFIRMATION MODAL */}
      {/* ===================================================================== */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <TrashBinIcon className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Delete Course Topics?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to delete all topics and document assets for{" "}
              <strong className="text-gray-900 dark:text-white">
                "{deleteModalItem.microcredentialCourseName}"
              </strong>
              ?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalItem(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 active:scale-95 transition"
              >
                {deleting ? (
                  <>
                    <div className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Topics</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. WATCH VIDEO MODAL (Opens video in modal on the same tab) */}
      {/* ===================================================================== */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            onClick={() => setActiveVideoModal(null)}
          />

          <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeVideoModal.courseName && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 truncate max-w-xs">
                      {activeVideoModal.courseName}
                    </span>
                  )}
                  {activeVideoModal.moduleName && (
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                      Module: {activeVideoModal.moduleName}
                    </span>
                  )}
                  {activeVideoModal.timing && (
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      ⏱ {activeVideoModal.timing}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5 truncate">
                  {activeVideoModal.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                title="Close"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="mt-4">
              {(() => {
                const videoInfo = getEmbedVideoInfo(activeVideoModal.url);
                if (!videoInfo || !videoInfo.src) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No valid video URL found for this topic.
                      </p>
                    </div>
                  );
                }

                if (videoInfo.type === "video") {
                  return (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner">
                      <video
                        controls
                        autoPlay
                        playsInline
                        src={videoInfo.src}
                        className="h-full w-full object-contain"
                      >
                        Your browser does not support HTML5 video.
                      </video>
                    </div>
                  );
                }

                return (
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner">
                    <iframe
                      src={videoInfo.src}
                      title={activeVideoModal.title || "Video player"}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              <a
                href={activeVideoModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
              >
                <span>Open in external tab</span>
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Resolves a video URL (YouTube, Vimeo, direct video file, or iframe) into embeddable format
 */
function getEmbedVideoInfo(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // 1. YouTube (watch?v=, youtu.be/, embed/, shorts/)
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // 2. Vimeo (vimeo.com/ID or player.vimeo.com/video/ID)
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // 3. Direct video file (.mp4, .webm, .ogg, .mov, etc.)
  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed);
  const resolvedUrl =
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
      ? trimmed
      : formatImageUrl(trimmed);

  if (isDirectVideo) {
    return {
      type: "video",
      src: resolvedUrl,
    };
  }

  // 4. Default iframe fallback
  return {
    type: "iframe",
    src: resolvedUrl,
  };
}

function BookIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}
