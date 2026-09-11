import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  PlusIcon,
  CheckCircleIcon,
  AlertIcon,
} from "../../icons";
import {
  uploadTrustedByLogoImages,
  addUpdateTrustedByLogo,
  getTrustedByLogoList,
  getTrustedByLogoImages,
  deleteTrustedByLogo,
} from "../../services/trustedByLogoService";
import { getHomeTrustedLogoList } from "../../services/homepageService";
import { formatImageUrl } from "../../dto/output/trustedByLogoOutputs";

export default function LogoList({ initialData = null, onDelete = () => {} } = {}) {
  // State management
  const [logos, setLogos] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modals state
  const [previewModalItem, setPreviewModalItem] = useState(null);
  const [previewModalImages, setPreviewModalImages] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [addModalError, setAddModalError] = useState("");
  const fileInputRef = useRef(null);

  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  /**
   * Fetches trusted logo list dynamically using POST /api/HomePageAPI/HomeTrustedLogoList
   */
  const fetchLogos = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch from HomeTrustedLogoList API
      const publicRes = await getHomeTrustedLogoList();
      const publicList =
        publicRes?.homeTrustedLogoList ||
        publicRes?.HomeTrustedLogoList ||
        publicRes?.data ||
        [];

      if (Array.isArray(publicList) && publicList.length > 0) {
        const mappedList = publicList.map((item, index) => {
          const id = Number(item.trustedByLogoId ?? item.TrustedByLogoId ?? index + 1);
          const path = item.filePath || item.FilePath || item.homeTrustedLogoImage || "";
          return {
            ...item,
            id,
            trustedByLogoId: id,
            filePath: path,
            uniqueKey: `${id}-${index}-${path}`,
          };
        });
        setLogos(mappedList);
      } else {
        // Fallback to getTrustedByLogoList if public list is empty
        const adminRes = await getTrustedByLogoList({
          adminId: 1,
          pageNo: 1,
          pageSize: 100,
          orderByColumn: "UpdatedOn",
          orderByDirection: "DESC",
          totalRecords: 0,
          searchInput: "",
        });
        const adminList = adminRes?.trustedByLogoList || [];
        const mappedAdmin = adminList.map((item, index) => {
          const id = Number(item.trustedByLogoId ?? item.TrustedByLogoId ?? index + 1);
          const path = item.filePath || item.FilePath || "";
          return {
            ...item,
            id,
            trustedByLogoId: id,
            filePath: path,
            uniqueKey: `${id}-${index}-${path}`,
          };
        });
        setLogos(mappedAdmin);
      }
    } catch (err) {
      console.error("Failed to load trusted logo list:", err);
      setErrorMessage(err.message || "Failed to load trusted logo list");
      setLogos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    if (!initialData) {
      fetchLogos();
    }
  }, [fetchLogos, initialData]);

  // Sorting handler
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

  // Extract values consistently regardless of casing
  const getItemValue = (item, key) => {
    switch (key) {
      case "id":
        return Number(
          item.trustedByLogoId ??
          item.TrustedByLogoId ??
          item.id ??
          item.Id ??
          0
        );
      case "filePath":
        return (
          item.filePath ||
          item.FilePath ||
          item.homeTrustedLogoImage ||
          item.imagePath ||
          item.logoImage ||
          item.image ||
          ""
        );
      default:
        return item[key] ?? "";
    }
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...logos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const path = getItemValue(item, "filePath").toLowerCase();
        return path.includes(q);
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = getItemValue(a, sortConfig.key);
        const valB = getItemValue(b, sortConfig.key);

        if (typeof valA === "number" && typeof valB === "number") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
        if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [logos, searchQuery, sortConfig]);

  // Reset page to 1 when search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Pagination calculations
  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentSafePage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentSafePage - 1) * pageSize + 1;
  const endIndex = Math.min(currentSafePage * pageSize, totalItems);

  // ===========================================================================
  // PREVIEW MODAL LOGIC (Fetches images via GetTrustedByLogoImages API)
  // ===========================================================================
  const handleOpenPreview = async (item) => {
    setPreviewModalItem(item);
    const initialPath = getItemValue(item, "filePath");
    setPreviewModalImages(initialPath ? [initialPath] : []);

    const id = getItemValue(item, "id");
    if (id > 0) {
      setPreviewLoading(true);
      try {
        const res = await getTrustedByLogoImages(id);
        if (res.success && Array.isArray(res.images) && res.images.length > 0) {
          setPreviewModalImages(res.images.map((img) => img.filePath));
        }
      } catch (err) {
        console.warn("Could not fetch remote logo images for preview:", err);
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  // ===========================================================================
  // DELETE LOGO (Calls POST /api/HomePageAPI/TrustedByLogoDelete)
  // ===========================================================================
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;

    const id = getItemValue(deleteModalItem, "id");
    const path = getItemValue(deleteModalItem, "filePath");
    setDeleting(true);

    try {
      if (id > 0) {
        const res = await deleteTrustedByLogo(id, 1);
        if (res.success) {
          setSuccessMessage(res.message || "Trusted logo deleted successfully.");
        }
      }

      setLogos((prev) =>
        prev.filter((item) => {
          const itemId = getItemValue(item, "id");
          const itemPath = getItemValue(item, "filePath");
          if (id > 0 && itemId === id) return false;
          return itemPath !== path;
        })
      );

      if (onDelete) onDelete(deleteModalItem);
      setDeleteModalItem(null);
    } catch (err) {
      console.error("Failed to delete trusted logo:", err);
      setErrorMessage(err.message || "Failed to delete trusted logo");
    } finally {
      setDeleting(false);
    }
  };

  // ===========================================================================
  // ADD LOGO MODAL LOGIC (Uploads via CommonUploadFile & calls TrustedByLogoAddUpdate)
  // ===========================================================================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setAddModalError("");
    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      // Validate file type (png, jpg, jpeg, svg)
      const isValidType =
        file.type.startsWith("image/") ||
        file.name.match(/\.(png|jpg|jpeg|svg)$/i);
      if (!isValidType) {
        setAddModalError("Only PNG, JPG, JPEG, and SVG image files are allowed.");
        return;
      }

      // Check max size (5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        setAddModalError(`File "${file.name}" exceeds maximum allowed size (5MB).`);
        return;
      }

      validFiles.push(file);
      previews.push({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        url: URL.createObjectURL(file),
      });
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      const target = prev[index];
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCloseAddModal = () => {
    if (uploading) return;
    filePreviews.forEach((p) => {
      if (p.url) URL.revokeObjectURL(p.url);
    });
    setSelectedFiles([]);
    setFilePreviews([]);
    setAddModalError("");
    setIsAddModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveNewLogo = async () => {
    if (selectedFiles.length === 0) {
      setAddModalError("Please select at least one logo image to upload.");
      return;
    }

    setUploading(true);
    setAddModalError("");

    try {
      // 1. Upload files to POST /api/AdminCommonAPI/CommonUploadFile
      // with UploadSource: "TrustedByLogoMaltiImages"
      const uploadResult = await uploadTrustedByLogoImages(selectedFiles);

      if (!uploadResult.success || uploadResult.fileList.length === 0) {
        throw new Error(
          uploadResult.message || "Failed to upload logo image(s) to server."
        );
      }

      // 2. Format Documents array for POST /api/HomePageAPI/TrustedByLogoAddUpdate
      const documents = uploadResult.fileList.map((item) => ({
        primarySource: "TrustedByLogoMaltiImages",
        secondarySouce: "",
        documentType: "TrustedByLogoMaltiImages",
        originalName: item.originalName || "",
        givenName: item.givenName || "",
        filePath: item.filePath || "",
        extension: item.fileExtension || "",
      }));

      // 3. Call TrustedByLogoAddUpdate
      const addUpdateResult = await addUpdateTrustedByLogo({
        adminId: 1,
        trustedByLogoId: 0,
        documents,
      });

      if (!addUpdateResult.success) {
        throw new Error(
          addUpdateResult.message || "Failed to save trusted logo record."
        );
      }

      setSuccessMessage("Trusted logo added successfully!");
      handleCloseAddModal();
      fetchLogos();
    } catch (err) {
      console.error("Failed to add trusted logo:", err);
      setAddModalError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <PageMeta
        title="Trusted Logos | Ignitoverse Admin"
        description="Manage company and partner logos displayed on the Ignitoverse homepage"
      />
      <PageBreadcrumb pageTitle="Trusted Logo List" />

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="rounded p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>
      )}

      {/* Table Container Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header bar with Search and + Add Trusted Logo Button */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          {/* Left: Search input */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logos..."
              className="w-full rounded-lg border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
            <svg
              className="absolute left-3 top-2.5 size-4 text-gray-400"
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
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: + Add Trusted Logo Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-600 active:scale-[0.98]"
          >
            <PlusIcon className="size-4" />
            <span>Add Trusted Logo</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <TableRow>
                {/* 1. Sr No */}
                <TableCell
                  isHeader
                  className="w-20 px-5 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Sr No.
                </TableCell>

                {/* 2. Logo Preview */}
                <TableCell
                  isHeader
                  className="px-6 py-3.5 text-start text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Logo Preview
                </TableCell>

                {/* 3. Action */}
                <TableCell
                  isHeader
                  className="px-6 py-3.5 text-end text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && logos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                      <span>Loading trusted logo list...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-12 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <svg
                          className="size-6 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {searchQuery ? "No matching logos found" : "No trusted logos found"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {searchQuery
                          ? "Try searching for a different keyword"
                          : "Click '+ Add Trusted Logo' to upload company logos"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const id = getItemValue(item, "id");
                  const rawPath = getItemValue(item, "filePath");
                  const imageUrl = formatImageUrl(rawPath);
                  const serialNo = (currentSafePage - 1) * pageSize + index + 1;

                  return (
                    <TableRow
                      key={item.uniqueKey || `${id}-${index}`}
                      className="hover:bg-gray-50/75 dark:hover:bg-white/[0.02]"
                    >
                      {/* 1. Sr No */}
                      <TableCell className="w-20 px-5 py-4 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                        {serialNo}
                      </TableCell>

                      {/* 2. Logo Preview */}
                      <TableCell className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item)}
                          className="group relative flex h-16 w-36 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-2.5 shadow-xs transition-all hover:border-brand-500 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800"
                          title="Click to preview logo"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt="Trusted Logo"
                              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/Ignitoverse_Logo.png";
                              }}
                            />
                          ) : (
                            <span className="text-xs text-gray-400">View Logo</span>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                            <svg
                              className="size-4 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.3-4.3" />
                              <path d="M11 8v6M8 11h6" />
                            </svg>
                          </span>
                        </button>
                      </TableCell>

                      {/* 3. Action */}
                      <TableCell className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Full Image */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(item)}
                            title="View Image"
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                          >
                            <svg
                              className="size-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalItem(item)}
                            title="Delete Logo"
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
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

        {/* Footer Bar below Table with Show entries, Refresh, Total Count, and Pagination */}
        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          {/* Left: Show Entries, Refresh, and Total Count */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchLogos}
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

            {/* Total Logos Count */}
            <div className="text-theme-xs text-gray-500 dark:text-gray-400">
              Total Logos:{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {totalItems}
              </span>
            </div>
          </div>

          {/* Right: Info and Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="text-theme-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-white">{startIndex}</span> to{" "}
                <span className="font-semibold text-gray-700 dark:text-white">{endIndex}</span> of{" "}
                <span className="font-semibold text-gray-700 dark:text-white">{totalItems}</span> entries
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                {/* Prev button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentSafePage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  ‹ Prev
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentSafePage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${isActive
                          ? "bg-brand-500 text-white shadow-xs"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentSafePage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. ADD TRUSTED LOGO MODAL                                              */}
      {/* ======================================================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={handleCloseAddModal}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white">
                  Add Trusted Logo
                </h3>
                <p className="text-xs text-gray-400">
                  Upload company or partner logo images (PNG, JPG, JPEG, SVG)
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={uploading}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Error in modal */}
            {addModalError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <AlertIcon className="size-4 shrink-0" />
                <span>{addModalError}</span>
              </div>
            )}

            {/* Upload Drag & Drop Area */}
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="trusted-logo-file-input"
              />

              <label
                htmlFor="trusted-logo-file-input"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/60 p-6 text-center transition hover:border-brand-500 hover:bg-brand-50/20 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-brand-400"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
                  <svg
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Click to upload logo(s)
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  PNG, JPG, JPEG, SVG up to 5MB each
                </span>
              </label>
            </div>

            {/* Selected Files Preview Grid */}
            {filePreviews.length > 0 && (
              <div className="mt-4 max-h-56 overflow-y-auto space-y-2 pr-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Selected Files ({filePreviews.length}):
                </span>
                {filePreviews.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-2.5 shadow-xs dark:border-gray-800 dark:bg-gray-800/80"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={file.url}
                        alt="Preview"
                        className="size-12 shrink-0 rounded-lg border border-gray-100 object-contain p-1 dark:border-gray-700"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-gray-400">{file.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(idx)}
                      disabled={uploading}
                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-gray-700"
                      title="Remove file"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={uploading}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewLogo}
                disabled={uploading || selectedFiles.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 disabled:opacity-50 active:scale-[0.98]"
              >
                {uploading ? (
                  <>
                    <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload & Save Logo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. IMAGE PREVIEW MODAL (With dynamic GetTrustedByLogoImages support)    */}
      {/* ======================================================================= */}
      {previewModalItem && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setPreviewModalItem(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                Trusted Logo Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Modal Image Box */}
            <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-800/60">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  <span className="text-xs text-gray-400">Loading logo...</span>
                </div>
              ) : previewModalImages.length > 0 ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  {previewModalImages.map((imgPath, idx) => (
                    <img
                      key={idx}
                      src={formatImageUrl(imgPath)}
                      alt={`Logo Preview ${idx + 1}`}
                      className="max-h-56 max-w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/Ignitoverse_Logo.png";
                      }}
                    />
                  ))}
                </div>
              ) : (
                <img
                  src={formatImageUrl(getItemValue(previewModalItem, "filePath"))}
                  alt="Logo Full View"
                  className="max-h-56 max-w-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/Ignitoverse_Logo.png";
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL                                            */}
      {/* ======================================================================= */}
      {deleteModalItem && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => !deleting && setDeleteModalItem(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                Confirm Delete
              </h3>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalItem(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this trusted logo? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalItem(null)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && (
                  <div className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
