import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
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
  AngleLeftIcon,
  FileIcon,
  CopyIcon,
} from "../../icons";
import {
  getMicrocredentialTopicByModuleId,
  microCourseTopicDelete,
  logJsError,
} from "../../services/adminMicrocredentialService";
import { useToast } from "../../context/ToastContext";
import { TableLoader } from "../common/DataLoader";

export default function ModuleTopicDetailList() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Extract moduleId and course context from URL or location state
  const moduleId = Number(params.moduleId || location.state?.moduleId || 0);
  const courseId = Number(
    location.state?.courseId ||
    location.state?.item?.microcredentialCourseId ||
    0
  );
  const courseName =
    location.state?.courseName ||
    (courseId ? `Course #${courseId}` : "Microcredential Course");
  const moduleName =
    location.state?.moduleName ||
    location.state?.item?.moduleName ||
    (moduleId ? `Module #${moduleId}` : "Module");
  const streamName = location.state?.streamName || "";
  const streamId = location.state?.streamId || 0;

  // Data & loading states
  const [topicList, setTopicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );

  // Search filter & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Video viewer modal state (for watching video if desired)
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  // Show toast notification on mount if passed in location state
  useEffect(() => {
    if (location.state?.successMessage) {
      showToast(location.state.successMessage, "success");
    }
    if (location.state?.errorMessage) {
      showToast(location.state.errorMessage, "error");
    }
  }, [location.state, showToast]);

  // Auto-dismiss inline notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Fetch topics for this specific module via GetMicrocredentialTopicByModuleId
  const fetchTopics = useCallback(async (isManualRefresh = false) => {
    if (!moduleId) {
      const msg = "No Module ID specified. Please select a module to view its topics.";
      setErrorMessage(msg);
      showToast(msg, "error");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getMicrocredentialTopicByModuleId(moduleId);

      if (response && (response.success !== false || Array.isArray(response.microcredentialTopicList))) {
        const list = response.microcredentialTopicList || [];
        setTopicList(Array.isArray(list) ? list : []);
        if (isManualRefresh) {
          showToast(`Topics refreshed (${(list || []).length} topics loaded)`, "success");
        }
      } else if (response?.message || response?.errorDescription) {
        const msg = response.message || response.errorDescription;
        setErrorMessage(msg);
        showToast(msg, "error");
        logJsError(msg, "", "ModuleTopicDetailList.jsx fetchTopics");
      } else {
        setTopicList([]);
        if (isManualRefresh) {
          showToast("No topics found for this module.", "info");
        }
      }
    } catch (err) {
      console.error("Error in fetchTopics:", err);
      const msg = err.message || "An unexpected error occurred while fetching module topics.";
      setErrorMessage(msg);
      showToast(msg, "error");
      logJsError(msg, err.stack, "ModuleTopicDetailList.jsx fetchTopics");
    } finally {
      setLoading(false);
    }
  }, [moduleId, showToast]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Delete Topic handler
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);

    try {
      const targetCourseId = Number(
        effectiveCourseId ||
        deleteModalItem.microcredentialCourseId ||
        deleteModalItem.MicrocredentialCourseId ||
        0
      );

      const res = await microCourseTopicDelete(targetCourseId, 1);
      if (res && res.success !== false) {
        const msg = res.message || `Topic "${deleteModalItem.topicName}" deleted successfully.`;
        setSuccessMessage(msg);
        showToast(msg, "success");
        setDeleteModalItem(null);
        fetchTopics();
      } else {
        const msg = res?.message || res?.errorDescription || "Failed to delete topic.";
        setErrorMessage(msg);
        showToast(msg, "error");
      }
    } catch (err) {
      console.error("Error deleting topic:", err);
      const msg = err.message || "An unexpected error occurred while deleting the topic.";
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyText = (text, label) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`, "success");
    } catch (e) {
      showToast("Unable to copy to clipboard", "error");
    }
  };

  // Effective Course ID
  const effectiveCourseId =
    courseId ||
    topicList[0]?.microcredentialCourseId ||
    0;

  // Search filtering
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topicList;
    const q = searchQuery.toLowerCase().trim();
    return topicList.filter(
      (t) =>
        (t.topicName && t.topicName.toLowerCase().includes(q)) ||
        (t.videoTitle && t.videoTitle.toLowerCase().includes(q))
    );
  }, [topicList, searchQuery]);

  // Pagination
  const totalRecords = filteredTopics.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);
  const paginatedTopics = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return filteredTopics.slice(start, start + pageSize);
  }, [filteredTopics, currentSafePage, pageSize]);

  return (
    <>
      <PageMeta
        title={`Topics: ${moduleName} | IgnitoVerse Admin`}
        description="View and manage topics, videos, and materials for this module."
      />
      <PageBreadcrumb pageTitle="Module Topics List" />

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

      {/* Module Context Header Banner */}
      <div className="mb-6 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/80 via-blue-50/40 to-transparent p-5 dark:border-purple-900/30 dark:bg-purple-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => {
                if (effectiveCourseId) {
                  navigate(`/microcredential/course-modules/${effectiveCourseId}`, {
                    state: { courseId: effectiveCourseId, courseName, streamId, streamName },
                  });
                } else {
                  navigate("/microcredential/module-list");
                }
              }}
              className="mt-0.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              title="Back to Course Modules"
            >
              <AngleLeftIcon className="size-3.5" />
              <span>Back to Modules</span>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Course: {courseName}
                </span>
                <span className="inline-block rounded-md bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {topicList.length} {topicList.length === 1 ? "Topic" : "Topics"}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                Module: {moduleName}
              </h2>
            </div>
          </div>

          {/* Top Right: Common Edit Button & Add Topic button */}
          <div className="flex items-center gap-2.5">
            {/* Common Edit Button: Opens Edit Form with all topics of this module */}
            <button
              type="button"
              onClick={() =>
                navigate(`/microcredential/topic-edit/${effectiveCourseId || 0}`, {
                  state: {
                    courseId: effectiveCourseId,
                    courseName,
                    streamId,
                    streamName,
                    moduleId,
                    moduleName,
                    isCourseLocked: true,
                    isModuleLocked: true,
                  },
                })
              }
              className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-xs font-semibold text-purple-700 shadow-xs hover:border-purple-300 hover:bg-purple-50 active:scale-95 transition dark:border-purple-800 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700"
              title="Edit all topics for this module"
            >
              <PencilIcon className="size-3.5" />
              <span>Edit Module Topics</span>
            </button>

            {/* Add Topic button */}
            <button
              type="button"
              onClick={() =>
                navigate("/microcredential/topic-add", {
                  state: {
                    courseId: effectiveCourseId,
                    courseName,
                    streamId,
                    streamName,
                    moduleId,
                    moduleName,
                    isCourseLocked: true,
                    isModuleLocked: true,
                  },
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 active:scale-95 transition"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Topic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Top Controls */}
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search topic name or video..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 transition-all"
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
              className="cursor-pointer rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>

            <button
              type="button"
              onClick={() => fetchTopics(true)}
              disabled={loading}
              className="ml-2 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              title="Refresh topics"
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Topics Table */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow className="bg-gray-50/70 hover:bg-transparent dark:bg-white/[0.02]">
                <TableCell isHeader className="w-16 px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sr No
                </TableCell>
                <TableCell isHeader className="min-w-[240px] px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Topic Name
                </TableCell>
                <TableCell isHeader className="min-w-[220px] px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Video
                </TableCell>
                <TableCell isHeader className="w-36 px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Document / PDF
                </TableCell>
             
              
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableLoader colSpan={6} text="Loading module topics..." />
              ) : paginatedTopics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    {searchQuery
                      ? "No topics match your search."
                      : "No topics found for this module. Click '+ Add Topic' or 'Edit Module Topics' above to add topics."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTopics.map((item, index) => {
                  const serialNo = (currentSafePage - 1) * pageSize + index + 1;
                  const hasVideo = Boolean(item.topicVideoUrl);
                  const hasPdf = Boolean(item.topicPdf);

                  return (
                    <TableRow
                      key={item.microCourseTopicId || index}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                    >
                      {/* 1. Sr No */}
                      <TableCell className="px-4 py-4 text-center text-sm font-medium text-gray-500">
                        {serialNo}
                      </TableCell>

                      {/* 2. Topic Name */}
                      <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <div>{item.topicName || `Topic #${item.microCourseTopicId}`}</div>
                        <span className="text-[11px] text-gray-400">
                          Topic ID: {item.microCourseTopicId}
                        </span>
                      </TableCell>

                      {/* 3. Video */}
                      <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium line-clamp-1" title={item.videoTitle || item.topicName}>
                            {item.videoTitle || item.topicName || "Topic Video"}
                          </span>
                          {hasVideo ? (
                            <button
                              type="button"
                              onClick={() => setActiveVideoUrl(item.topicVideoUrl)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 w-fit cursor-pointer"
                            >
                              <EyeIcon className="size-3.5" />
                              <span>Watch Video</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No video URL</span>
                          )}
                        </div>
                      </TableCell>

                      {/* 4. PDF / Document */}
                      <TableCell className="px-4 py-4 text-center">
                        {hasPdf ? (
                          <a
                            href={item.topicPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                          >
                            <FileIcon className="size-3.5" />
                            <span>PDF Document</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>

                 
                      

                   
                     
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Pagination */}
        {filteredTopics.length > 0 && (
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

      {/* Video Player Modal (Only for video playback) */}
      {activeVideoUrl && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setActiveVideoUrl(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
              <h4 className="text-sm font-semibold">Watch Video</h4>
              <button
                type="button"
                onClick={() => setActiveVideoUrl(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {activeVideoUrl.includes("youtube.com") || activeVideoUrl.includes("youtu.be") ? (
                <iframe
                  src={
                    activeVideoUrl.includes("watch?v=")
                      ? activeVideoUrl.replace("watch?v=", "embed/")
                      : activeVideoUrl.includes("youtu.be/")
                      ? activeVideoUrl.replace("youtu.be/", "www.youtube.com/embed/")
                      : activeVideoUrl
                  }
                  title="Topic Video"
                  className="size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={activeVideoUrl} controls autoPlay className="size-full object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
                <TrashBinIcon className="size-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Delete Topic
              </h3>
            </div>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete topic{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                "{deleteModalItem.topicName}"
              </span>
              ?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalItem(null)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
