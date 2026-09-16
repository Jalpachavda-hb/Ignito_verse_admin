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
  ListIcon,
} from "../../icons";
import {
  getMicrocredentialModuleByCourseId,
  microcredentialModuleMasterDelete,
  logJsError,
} from "../../services/adminMicrocredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function CourseModuleDetailList() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Extract courseId from URL params or location state
  const courseId = Number(params.courseId || location.state?.courseId || 0);
  const courseName =
    location.state?.courseName ||
    location.state?.item?.microcredentialCourseName ||
    (courseId ? `Course #${courseId}` : "");
  const streamName = location.state?.streamName || location.state?.item?.streamName || "";
  const streamId = location.state?.streamId || location.state?.item?.streamId || 0;

  // Data & loading states
  const [moduleList, setModuleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch Modules for this specific Course using GetMicrocredentialModuleByCourseId API
  const fetchModules = useCallback(async () => {
    if (!courseId) {
      setErrorMessage("No Course ID specified. Please select a course from the course list.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await getMicrocredentialModuleByCourseId(courseId);

      if (response && (response.success !== false || Array.isArray(response.microcredentialModuleList))) {
        const list = response.microcredentialModuleList || [];
        setModuleList(Array.isArray(list) ? list : []);
      } else if (response?.message || response?.errorDescription) {
        const msg = response.message || response.errorDescription;
        setErrorMessage(msg);
        logJsError(msg, "", "CourseModuleDetailList.jsx fetchModules");
      } else {
        setModuleList([]);
      }
    } catch (err) {
      console.error("Error in fetchModules:", err);
      const msg = err.message || "An unexpected error occurred while fetching modules.";
      setErrorMessage(msg);
      logJsError(msg, err.stack, "CourseModuleDetailList.jsx fetchModules");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return moduleList;
    const q = searchQuery.toLowerCase().trim();
    return moduleList.filter(
      (m) =>
        (m.moduleName && m.moduleName.toLowerCase().includes(q)) ||
        (m.moduleDescription && m.moduleDescription.toLowerCase().includes(q))
    );
  }, [moduleList, searchQuery]);

  // Pagination calculations
  const totalRecords = filteredModules.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);
  const paginatedModules = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return filteredModules.slice(start, start + pageSize);
  }, [filteredModules, currentSafePage, pageSize]);

  // Delete Module handler
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;
    setDeleting(true);

    try {
      const response = await microcredentialModuleMasterDelete(
        deleteModalItem.microcredentialModuleMasterId,
        1
      );

      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Module deleted successfully.");
        setDeleteModalItem(null);
        fetchModules();
      } else {
        const msg = response?.message || "Failed to delete module.";
        setErrorMessage(msg);
        logJsError(msg, "", "CourseModuleDetailList.jsx handleDeleteConfirm");
      }
    } catch (err) {
      console.error("Error deleting module:", err);
      const msg = err.message || "An unexpected error occurred.";
      setErrorMessage(msg);
      logJsError(msg, err.stack, "CourseModuleDetailList.jsx handleDeleteConfirm");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`Modules: ${courseName || "Course Modules"} | IgnitoVerse Admin`}
        description="Manage modules, banner images, and topic listings for this microcredential course."
      />
      <PageBreadcrumb pageTitle="Course Modules List" />

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

      {/* Course Context Header Banner */}
      <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-transparent p-5 dark:border-blue-900/30 dark:bg-blue-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/microcredential/module-list")}
              className="mt-0.5 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-95 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              title="Back to Course List"
            >
              <AngleLeftIcon className="size-3.5" />
              <span>Back to Courses</span>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Course Modules
                </span>
                {streamName && (
                  <span className="inline-block rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                    {streamName}
                  </span>
                )}
                <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {moduleList.length} {moduleList.length === 1 ? "Module" : "Modules"}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                {courseName || `Course ID #${courseId}`}
              </h2>
            </div>
          </div>

          {/* Top Right Action: Add Module */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate("/microcredential/module-add", {
                  state: {
                    courseId,
                    courseName,
                    streamId,
                    streamName,
                    isCourseLocked: true,
                  },
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Module</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Top Filter Bar */}
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search module name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
              onClick={fetchModules}
              disabled={loading}
              className="ml-2 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              title="Refresh modules"
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Modules Table */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow className="bg-gray-50/70 hover:bg-transparent dark:bg-white/[0.02]">
                <TableCell isHeader className="w-16 px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sr No
                </TableCell>
                <TableCell isHeader className="min-w-[220px] px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Module Name
                </TableCell>
                <TableCell isHeader className="w-24 px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Banner
                </TableCell>
                <TableCell isHeader className="min-w-[280px] px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Description
                </TableCell>
                <TableCell isHeader className="w-48 px-4 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span className="text-sm">Loading course modules...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    {searchQuery
                      ? "No modules match your search."
                      : "No modules found for this course. Click '+ Add Module' above to create one."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedModules.map((item, index) => {
                  const bannerUrl = item.moduleBannerImage ? formatImageUrl(item.moduleBannerImage) : "";
                  const serialNo = (currentSafePage - 1) * pageSize + index + 1;

                  return (
                    <TableRow
                      key={item.microcredentialModuleMasterId || index}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50/50 dark:border-gray-800/60 dark:hover:bg-gray-800/30"
                    >
                      {/* 1. Sr No */}
                      <TableCell className="px-4 py-4 text-center text-sm font-medium text-gray-500">
                        {serialNo}
                      </TableCell>

                      {/* 2. Module Name */}
                      <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {item.moduleName}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          Module ID: {item.microcredentialModuleMasterId}
                        </span>
                      </TableCell>

                      {/* 3. Banner Image */}
                      <TableCell className="px-4 py-4 text-center">
                        {bannerUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(bannerUrl)}
                            className="inline-flex size-10 items-center justify-center overflow-hidden rounded-lg border border-gray-200 transition-opacity hover:opacity-80 dark:border-gray-700"
                            title="Click to view full banner"
                          >
                            <img
                              src={bannerUrl}
                              alt={item.moduleName}
                              className="size-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/newlg.png";
                              }}
                            />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>

                      {/* 4. Description */}
                      <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="line-clamp-2 max-w-md" title={item.moduleDescription}>
                          {item.moduleDescription || "—"}
                        </div>
                      </TableCell>

                      {/* 5. Actions */}
                      <TableCell className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Topics Button (Module-wise Topics) */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/microcredential/module-topics/${item.microcredentialModuleMasterId}`, {
                                state: {
                                  courseId,
                                  courseName,
                                  streamId,
                                  streamName,
                                  moduleId: item.microcredentialModuleMasterId,
                                  moduleName: item.moduleName,
                                  item,
                                },
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-xs hover:bg-blue-100 active:scale-95 transition dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60"
                            title="View Topics of this Module"
                          >
                            <ListIcon className="size-3.5" />
                            <span>View Topics</span>
                          </button>

                          {/* Quick + Topic button */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/microcredential/topic-add", {
                                state: {
                                  courseId,
                                  courseName,
                                  streamId,
                                  streamName,
                                  moduleId: item.microcredentialModuleMasterId,
                                  moduleName: item.moduleName,
                                  isCourseLocked: true,
                                  isModuleLocked: true,
                                },
                              })
                            }
                            title="Add Topic to this Module"
                            className="rounded-lg p-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                          >
                            + Topic
                          </button>

                          {/* Edit Module */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/microcredential/module-edit/${item.microcredentialModuleMasterId}`, {
                                state: {
                                  item,
                                  courseId,
                                  courseName,
                                  streamId,
                                  streamName,
                                  isCourseLocked: true,
                                },
                              })
                            }
                            title="Edit Module"
                            className="rounded-lg p-1.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <PencilIcon className="size-4" />
                          </button>

                          {/* Delete Module */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalItem(item)}
                            title="Delete Module"
                            className="rounded-lg p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <TrashBinIcon className="size-4" />
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
        {filteredModules.length > 0 && (
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Module Banner Preview
              </h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
              <img
                src={previewImage}
                alt="Module Banner"
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
              />
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
                Delete Module
              </h3>
            </div>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete module{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                "{deleteModalItem.moduleName}"
              </span>
              ? This action will remove the module and its associated topics.
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
