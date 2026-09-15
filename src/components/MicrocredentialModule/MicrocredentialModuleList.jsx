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
  TrashBinIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  EyeIcon,
  PencilIcon,
  AngleLeftIcon,
  AngleRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../../icons";
import {
  microcredentialModuleMasterList,
  microcredentialModuleMasterDelete,
  logJsError,
} from "../../services/adminMicrocredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function MicrocredentialModuleList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Data & loading states
  const [moduleList, setModuleList] = useState([]);
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
  const [orderByColumn, setOrderByColumn] = useState("UpdatedOn");
  const [orderByDirection, setOrderByDirection] = useState("DESC");

  // Modals state
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Fetch Module List
  const fetchModules = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await microcredentialModuleMasterList(
        currentPage,
        pageSize,
        orderByColumn,
        orderByDirection,
        debouncedSearch,
        1
      );

      if (response && response.success !== false) {
        const list = response.microcredentialModuleMasterList || [];
        setModuleList(list);
        setTotalRecords(response.pageDetail?.totalRecords ?? list.length);
      } else {
        const msg = response?.message || "Failed to load module list.";
        setErrorMessage(msg);
        logJsError(msg, "", "MicrocredentialModuleList.jsx fetchModules");
      }
    } catch (err) {
      console.error("Error in fetchModules:", err);
      const msg = err.message || "An unexpected error occurred while fetching modules.";
      setErrorMessage(msg);
      logJsError(msg, err.stack, "MicrocredentialModuleList.jsx fetchModules");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, orderByColumn, orderByDirection, debouncedSearch]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

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

  // Delete Module
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
        logJsError(msg, "", "MicrocredentialModuleList.jsx handleDeleteConfirm");
      }
    } catch (err) {
      console.error("Error deleting module:", err);
      const msg = err.message || "An unexpected error occurred.";
      setErrorMessage(msg);
      logJsError(msg, err.stack, "MicrocredentialModuleList.jsx handleDeleteConfirm");
    } finally {
      setDeleting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const visiblePages = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <>
      <PageMeta
        title="Microcredential Module List | IgnitoVerse Admin"
        description="Manage microcredential course modules, descriptions, and learning outcomes."
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

      {/* Main Container */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        {/* Top Actions: Search + Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search module or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/microcredential/module-add"
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[#1D64F2] hover:bg-[#1855D1] rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>+ Add Module</span>
            </Link>
          </div>
        </div>

        {/* Entries Dropdown */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        {/* Modules Table */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow className="hover:bg-transparent">
                <TableCell isHeader className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm w-16">
                  Sr No
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none"
                  onClick={() => handleSort("MicrocredentialCourseName")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Course Name</span>
                    <span className="text-gray-400">
                      {orderByColumn === "MicrocredentialCourseName" ? (
                        orderByDirection === "ASC" ? <ChevronUpIcon className="size-3.5 inline" /> : <ChevronDownIcon className="size-3.5 inline" />
                      ) : (
                        "▾"
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none"
                  onClick={() => handleSort("ModuleName")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Module Name</span>
                    <span className="text-gray-400">
                      {orderByColumn === "ModuleName" ? (
                        orderByDirection === "ASC" ? <ChevronUpIcon className="size-3.5 inline" /> : <ChevronDownIcon className="size-3.5 inline" />
                      ) : (
                        "▾"
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm w-24">
                  Banner
                </TableCell>
                <TableCell isHeader className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort("UpdatedOn")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Updated On</span>
                    <span className="text-gray-400">
                      {orderByColumn === "UpdatedOn" ? (
                        orderByDirection === "ASC" ? <ChevronUpIcon className="size-3.5 inline" /> : <ChevronDownIcon className="size-3.5 inline" />
                      ) : (
                        "▾"
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell isHeader className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading modules...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : moduleList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No modules found. Click "+ Add Module" to create the first module.
                  </TableCell>
                </TableRow>
              ) : (
                moduleList.map((item, index) => {
                  const bannerUrl = item.moduleBannerImage ? formatImageUrl(item.moduleBannerImage) : "";
                  const serialNo = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <TableRow
                      key={item.microcredentialModuleMasterId || index}
                      className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <TableCell className="py-4 px-4 text-center text-sm font-medium text-gray-500">
                        {serialNo}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-xs">
                        {item.microcredentialCourseName || `Course #${item.microcredentialCourseId}`}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-sm text-gray-800 dark:text-gray-100 font-medium max-w-xs">
                        {item.moduleName}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-center">
                        {bannerUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(bannerUrl)}
                            className="size-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 inline-flex items-center justify-center hover:opacity-80 transition-opacity"
                            title="Click to view full banner"
                          >
                            <img
                              src={bannerUrl}
                              alt={item.moduleName}
                              className="size-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/Ignitoverse Logonew.png";
                              }}
                            />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 max-w-sm line-clamp-2">
                        {item.moduleDescription || "-"}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {item.updatedOn || "-"}
                      </TableCell>

                      <TableCell className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Add Topics directly for this module */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/microcredential/topic-add", {
                                state: {
                                  courseId: item.microcredentialCourseId,
                                  moduleId: item.microcredentialModuleMasterId,
                                },
                              })
                            }
                            title="Add Topics to this Module"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xs font-medium"
                          >
                            + Topic
                          </button>

                          {/* Edit Module */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/microcredential/module-edit/${item.microcredentialModuleMasterId}`, {
                                state: { item },
                              })
                            }
                            title="Edit Module"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <PencilIcon className="size-4" />
                          </button>

                          {/* Delete Module */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalItem(item)}
                            title="Delete Module"
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
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

        {/* Footer: Showing entries + Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            Showing {startRecord} to {endRecord} of {totalRecords} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <AngleLeftIcon className="size-4" />
            </button>

            {visiblePages.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-8 h-8 px-2.5 rounded-md text-sm font-medium transition-all ${currentPage === pageNum
                    ? "bg-[#e11d48] text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <AngleRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* BANNER IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl max-h-[85vh] p-4 overflow-hidden border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
            >
              <CloseIcon className="size-5" />
            </button>
            <img
              src={previewImage}
              alt="Module Banner"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/Ignitoverse Logonew.png";
              }}
            />
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-full">
                <TrashBinIcon className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Delete Module
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to delete this module?
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-800 dark:text-gray-200 font-semibold mb-2">
              {deleteModalItem.moduleName}
            </div>
            <p className="text-xs text-red-500 mb-6">
              This action will soft-delete the module and deactivate all its associated topics.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
