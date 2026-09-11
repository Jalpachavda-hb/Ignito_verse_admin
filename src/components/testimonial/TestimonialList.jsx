import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
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
  PencilIcon,
  TrashBinIcon,
  CloseIcon,
  PlusIcon,
  CheckCircleIcon,
  AlertIcon,
} from "../../icons";
import {
  getTestimonialReviewLists,
  deleteTestimonialReview,
} from "../../services/AdminHomePageServices";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function TestimonialList({
  initialData = null,
  onEdit = null,
  onDelete = null,
} = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Data and UI states
  const [testimonials, setTestimonials] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "updatedOn",
    direction: "desc",
  });

  // Modal states for delete & description viewer
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Fetches dynamic testimonials from backend API.
   * API: POST /api/AdminSetUpAPI/GetTestimonialReviewList
   */
  const fetchTestimonials = useCallback(() => {
    setLoading(true);
    setErrorMessage("");

    getTestimonialReviewLists()
      .then((res) => {
        const list =
          res?.testimonialReviewList ||
          res?.testimonialReview ||
          res?.testimonialReviewLists ||
          res?.data ||
          res?.rawData?.testimonialReviewListOutputParameters ||
          res?.rawData?.testimonialReviewLists ||
          res?.rawData?.data ||
          [];

        if (Array.isArray(list) && list.length > 0) {
          setTestimonials(list);
        } else if (res?.success === false) {
          setErrorMessage(
            res?.message || res?.errorDescription || "Failed to load testimonials."
          );
          setTestimonials([]);
        } else {
          setTestimonials([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load testimonials:", err);
        setErrorMessage(err.message || "Failed to load testimonials.");
        setTestimonials([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle flash messages from route navigation (e.g. from Add or Edit page)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => setSuccessMessage(""), 4500);
      try {
        window.history.replaceState({}, document.title);
      } catch {}
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Run on mount
  useEffect(() => {
    if (!initialData) {
      fetchTestimonials();
    }
  }, [initialData, fetchTestimonials]);

  /**
   * Deletes a testimonial review record.
   * API: POST /api/AdminSetUpAPI/DeleteTestimonialReview
   */
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;

    const reviewId = Number(
      deleteModalItem.testimonialReviewMasterId ||
      deleteModalItem.TestimonialReviewMasterId ||
      deleteModalItem.id ||
      0
    );

    setDeletingId(reviewId);
    setErrorMessage("");

    try {
      const res = await deleteTestimonialReview(reviewId, 1);
      if (res?.success || res?.isSuccess) {
        setTestimonials((prev) =>
          prev.filter(
            (item) =>
              Number(
                item.testimonialReviewMasterId ||
                item.TestimonialReviewMasterId ||
                item.id ||
                0
              ) !== reviewId
          )
        );
        setSuccessMessage(res?.message || "Testimonial review deleted successfully.");
        setDeleteModalItem(null);
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error(res?.message || "Failed to delete review.");
      }
    } catch (err) {
      console.error("Delete review error:", err);
      setErrorMessage(err.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

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

  // Helper to extract values for sorting & searching regardless of casing
  const getItemValue = (item, key) => {
    switch (key) {
      case "reviewerName":
        return item.reviewerName || item.ReviewerName || item.clientName || item.name || "";
      case "reviewerDesignation":
        return item.reviewerDesignation || item.ReviewerDesignation || item.designation || "";
      case "reviewInStar":
        return Number(item.reviewInStar ?? item.ReviewInStar ?? item.rating ?? 0);
      case "updatedOn":
        return item.updatedOn || item.UpdatedOn || item.createdDate || "";
      case "id":
        return Number(item.testimonialReviewMasterId ?? item.TestimonialReviewMasterId ?? item.id ?? 0);
      default:
        return item[key] ?? "";
    }
  };

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...testimonials];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = getItemValue(item, "reviewerName").toLowerCase();
        const desig = getItemValue(item, "reviewerDesignation").toLowerCase();
        return name.includes(q) || desig.includes(q);
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = getItemValue(a, sortConfig.key);
        let valB = getItemValue(b, sortConfig.key);

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [testimonials, searchQuery, sortConfig]);

  // Date formatter
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full">
      <PageMeta
        title="Testimonial Review List | IgnitoVerse Admin"
        description="Manage customer testimonials and reviews"
      />
      <PageBreadcrumb pageTitle="Testimonial Reviews" />

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircleIcon className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="flex-1 font-medium">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
          <span className="flex-1 font-medium">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="rounded-lg p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-white/[0.05] dark:bg-gray-900">
        {/* Table Top Controls */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          {/* Search Box */}
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by reviewer name or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchTestimonials}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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

            {/* + Add Testimonial Review Button */}
            <button
              type="button"
              onClick={() => navigate("/website/add-testimonial-review")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-600 active:scale-[0.98]"
            >
              <PlusIcon className="size-4" />
              <span>Add Testimonial Review</span>
            </button>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Reviews:{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {processedData.length}
              </span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <TableRow>
                {/* 1. Reviewer Name */}
                <TableCell
                  isHeader
                  className="cursor-pointer px-5 py-3.5 text-start text-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("reviewerName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Reviewer</span>
                    {sortConfig.key === "reviewerName" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 2. Designation */}
                <TableCell
                  isHeader
                  className="cursor-pointer px-4 py-3.5 text-start text-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("reviewerDesignation")}
                >
                  <div className="flex items-center gap-1">
                    <span>Designation</span>
                    {sortConfig.key === "reviewerDesignation" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 3. Star Rating */}
                <TableCell
                  isHeader
                  className="cursor-pointer px-4 py-3.5 text-start text-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("reviewInStar")}
                >
                  <div className="flex items-center gap-1">
                    <span>Rating</span>
                    {sortConfig.key === "reviewInStar" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 4. Description */}
                <TableCell
                  isHeader
                  className="px-4 py-3.5 text-start text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Review Description
                </TableCell>

                {/* 5. Updated Date */}
                <TableCell
                  isHeader
                  className="cursor-pointer px-4 py-3.5 text-start text-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("updatedOn")}
                >
                  <div className="flex items-center gap-1">
                    <span>Updated On</span>
                    {sortConfig.key === "updatedOn" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 6. Actions */}
                <TableCell
                  isHeader
                  className="px-4 py-3.5 text-center text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span>Loading testimonials...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : processedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    <p className="font-medium text-gray-600 dark:text-gray-300">
                      No testimonial reviews found.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/website/add-testimonial-review")}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600"
                    >
                      <PlusIcon className="size-3.5" />
                      <span>Add First Testimonial</span>
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                processedData.map((item, index) => {
                  const name = getItemValue(item, "reviewerName");
                  const designation = getItemValue(item, "reviewerDesignation");
                  const rating = getItemValue(item, "reviewInStar");
                  const description =
                    item.reviewDescription ||
                    item.ReviewDescription ||
                    item.description ||
                    "";
                  const rawImagePath =
                    item.reviewerImagePath ||
                    item.ReviewerImagePath ||
                    item.imagePath ||
                    "";
                  const imageUrl = formatImageUrl(rawImagePath);
                  const updatedOnDate = getItemValue(item, "updatedOn");

                  return (
                    <TableRow
                      key={item.testimonialReviewMasterId || index}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                    >
                      {/* Reviewer Name & Avatar */}
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="size-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                            {rawImagePath ? (
                              <img
                                src={imageUrl}
                                alt={name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/Ignitoverse_Logo.png";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-brand-50 font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-gray-800 dark:text-white">
                              {name || "Anonymous"}
                            </span>
                            <span className="block text-xs text-gray-400">
                              ID #{getItemValue(item, "id")}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Designation */}
                      <TableCell className="px-4 py-4 text-start text-xs text-gray-600 dark:text-gray-300">
                        {designation || "—"}
                      </TableCell>

                      {/* Star Rating */}
                      <TableCell className="px-4 py-4 text-start">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= rating
                                  ? "text-amber-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {rating}/5
                          </span>
                        </div>
                      </TableCell>

                      {/* Review Description */}
                      <TableCell className="px-4 py-4 text-start text-xs text-gray-600 dark:text-gray-400">
                        <div className="max-w-md">
                          <p className="line-clamp-2 leading-relaxed">
                            {description || "No description provided."}
                          </p>
                          {description.length > 90 && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDescription({
                                  name,
                                  designation,
                                  rating,
                                  description,
                                })
                              }
                              className="mt-1 text-xs font-medium text-brand-500 hover:underline"
                            >
                              Read full review →
                            </button>
                          )}
                        </div>
                      </TableCell>

                      {/* Updated On */}
                      <TableCell className="px-4 py-4 text-start text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(updatedOnDate)}
                      </TableCell>

                      {/* Action Buttons: Edit & Delete */}
                      <TableCell className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            title="Edit Review"
                            onClick={() => {
                              if (onEdit) {
                                onEdit(item);
                              } else {
                                const rId = Number(
                                  item.testimonialReviewMasterId ||
                                  item.TestimonialReviewMasterId ||
                                  item.id ||
                                  0
                                );
                                navigate(`/website/edit-testimonial-review/${rId}`, {
                                  state: { item },
                                });
                              }
                            }}
                            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-xs transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            title="Delete Review"
                            onClick={() =>
                              onDelete ? onDelete(item) : setDeleteModalItem(item)
                            }
                            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-xs transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <TrashBinIcon className="size-3.5" />
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
      </div>



      {/* ======================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                               */}
      {/* ======================================================================= */}
      {deleteModalItem && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => !deletingId && setDeleteModalItem(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                Delete Testimonial
              </h3>
              <button
                type="button"
                onClick={() => !deletingId && setDeleteModalItem(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
              Are you sure you want to delete the testimonial review from{" "}
              <strong className="text-gray-900 dark:text-white">
                {getItemValue(deleteModalItem, "reviewerName")}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setDeleteModalItem(null)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <div className="size-3 animate-spin rounded-full border border-white border-t-transparent" />
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

      {/* ======================================================================= */}
      {/* DESCRIPTION VIEW MODAL                                                  */}
      {/* ======================================================================= */}
      {selectedDescription && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedDescription(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedDescription.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedDescription.designation} • Rating:{" "}
                  {selectedDescription.rating} ★
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDescription(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Review Description
              </h4>
              <p className="max-h-60 overflow-y-auto text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {selectedDescription.description}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDescription(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
