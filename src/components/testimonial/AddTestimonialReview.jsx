import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import PageMeta from "../common/PageMeta";
import {
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
  PencilIcon,
} from "../../icons";
import {
  addUpdateTestimonialReview,
  uploadTestimonialImage,
} from "../../services/AdminHomePageServices";

export default function AddTestimonialReview() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    testimonialReviewMasterId: 0,
    reviewerName: "",
    reviewerDesignation: "",
    reviewInStar: 5,
    reviewDescription: "",
    reviewerImagePath: "",
    givenFileName: "",
    originalFileName: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUri, setImagePreviewUri] = useState("");

  const ratingDescriptions = {
    1: "Poor (1 Star)",
    2: "Fair (2 Stars)",
    3: "Good (3 Stars)",
    4: "Very Good (4 Stars)",
    5: "Excellent (5 Stars)",
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)/i)) {
      setErrorMessage("Please select a valid image file (.jpg, .jpeg, .png, .webp).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file size should be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    setImagePreviewUri(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setImagePreviewUri("");
    setFormData((prev) => ({
      ...prev,
      reviewerImagePath: "",
      givenFileName: "",
      originalFileName: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reviewerName.trim()) {
      setErrorMessage("Please enter reviewer name.");
      return;
    }

    if (!formData.reviewDescription.trim()) {
      setErrorMessage("Please enter review description / commentary.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let finalImagePath = "";
      let finalGivenName = "";
      let finalOriginalName = "";

      // 1. Upload reviewer image if a file was selected
      if (selectedFile) {
        setUploadingImage(true);
        const uploadRes = await uploadTestimonialImage(selectedFile, "");

        if (uploadRes?.filePath) {
          finalImagePath = uploadRes.filePath;
          finalGivenName = uploadRes.givenName || selectedFile.name;
          finalOriginalName = uploadRes.originalName || selectedFile.name;
        } else if (uploadRes?.fileList?.[0]?.filePath) {
          finalImagePath = uploadRes.fileList[0].filePath;
          finalGivenName = uploadRes.fileList[0].givenName || selectedFile.name;
          finalOriginalName = uploadRes.fileList[0].originalName || selectedFile.name;
        } else {
          throw new Error(uploadRes?.message || "Failed to upload reviewer photo.");
        }
        setUploadingImage(false);
      }

      // 2. Prepare payload for Add
      const payload = {
        AdminId: 1,
        TestimonialReviewMasterId: 0,
        ReviewInStar: Number(formData.reviewInStar || 5),
        ReviewDescription: formData.reviewDescription.trim(),
        ReviewerName: formData.reviewerName.trim(),
        ReviewerDesignation: formData.reviewerDesignation.trim(),
        ReviewerImagePath: finalImagePath,
        GivenFileName: finalGivenName,
        OriginalFileName: finalOriginalName,
      };

      // 3. Call Add API
      const res = await addUpdateTestimonialReview(payload);

      if (res?.success || res?.isSuccess) {
        const msg = res?.message || "Testimonial review added successfully!";
        setSuccessMessage(msg);

        // Navigate back to the Testimonial List page with success message
        setTimeout(() => {
          navigate("/website/testimonial-review-list", {
            state: { successMessage: msg },
          });
        }, 700);
      } else {
        throw new Error(res?.message || "Failed to save testimonial review.");
      }
    } catch (err) {
      console.error("Add testimonial review error:", err);
      setErrorMessage(err.message || "Failed to save testimonial review.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="w-full pb-12">
      <PageMeta
        title="Add Testimonial Review | IgnitoVerse Admin"
        description="Add a new customer testimonial review"
      />

      {/* Clean Modern Page Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5 dark:border-gray-800">
        <div>
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <Link to="/" className="hover:text-brand-500 transition">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/website/testimonial-review-list"
              className="hover:text-brand-500 transition"
            >
              Website Content
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              Add Testimonial
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Add Testimonial Review
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Create and publish client or student testimonials that showcase on the website homepage.
          </p>
        </div>

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/website/testimonial-review-list")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Testimonial List</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircleIcon className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="flex-1 font-medium">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
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
            className="rounded-lg p-1 text-red-600 hover:bg-red-100"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      )}

      {/* 2-Column Responsive Form Layout (8 cols form, 4 cols preview) */}
      <div className="grid gap-6 xl:grid-cols-12">
        {/* Form Column */}
        <div className="xl:col-span-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
            {/* Form Section Header */}
            <div className="border-b border-gray-100 px-6 py-4.5 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                Review Details
              </h2>
              <p className="text-xs text-gray-400">
                Please enter the reviewer's personal details, evaluation rating, and full commentary.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
              {/* Row 1: Reviewer Name & Role */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Reviewer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.reviewerName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, reviewerName: e.target.value }))
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-transparent px-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Cloud Architect at AWS"
                    value={formData.reviewerDesignation}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        reviewerDesignation: e.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-gray-200 bg-transparent px-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Row 2: Star Rating Selector */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Star Rating (1 to 5) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-2xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, reviewInStar: star }))
                        }
                        className={`transition duration-150 hover:scale-125 focus:outline-none ${star <= formData.reviewInStar
                            ? "text-amber-400"
                            : "text-gray-200 dark:text-gray-700 hover:text-amber-300"
                          }`}
                        title={`${star} Star${star > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="rounded-lg bg-amber-50 border border-amber-200/60 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                    {ratingDescriptions[formData.reviewInStar] || `${formData.reviewInStar} of 5 Stars`}
                  </span>
                </div>
              </div>

              {/* Row 3: Review Description / Commentary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Review Description / Feedback <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {formData.reviewDescription.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Share reviewer feedback, key takeaways, or quotes about the learning experience with IgnitoVerse..."
                  value={formData.reviewDescription}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      reviewDescription: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-transparent p-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              {/* Row 4: Reviewer Profile Photo */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Reviewer Photo
                </label>
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  {/* Photo Avatar Preview */}
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    {imagePreviewUri ? (
                      <img
                        src={imagePreviewUri}
                        alt="Reviewer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-brand-50 font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                        {formData.reviewerName ? formData.reviewerName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex flex-1 flex-col gap-1.5 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{imagePreviewUri ? "Change Profile Photo" : "Upload Profile Photo"}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {imagePreviewUri && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-gray-800 dark:hover:bg-red-950/40"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-400">
                      Recommended: Square JPG or PNG, max 5MB.
                      {selectedFile && (
                        <span className="ml-1 font-medium text-brand-600 dark:text-brand-400">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => navigate("/website/testimonial-review-list")}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-7 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{uploadingImage ? "Uploading Photo..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>Save Testimonial</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Card Preview Column */}
        <div className="xl:col-span-4">
          <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            {/* Preview Header */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3.5 dark:border-gray-800">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Card Preview
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </span>
            </div>

            {/* Simulated Website Card */}
            <div className="relative rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50/70 to-white p-5 shadow-sm dark:border-gray-800 dark:from-gray-800/40 dark:to-gray-900">
              {/* Quote Icon */}
              <div className="mb-3 text-3xl font-serif text-brand-400 opacity-40 select-none">
                “
              </div>

              {/* Star Rating */}
              <div className="mb-3 flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= formData.reviewInStar
                        ? "text-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                    }
                  >
                    ★
                  </span>
                ))}
                <span className="ml-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {formData.reviewInStar}.0
                </span>
              </div>

              {/* Review Text */}
              <p className="min-h-[70px] text-sm italic leading-relaxed text-gray-700 dark:text-gray-300">
                "{formData.reviewDescription || "The feedback commentary provided by the student or client will appear right here in real-time as you type..."}"
              </p>

              {/* Reviewer Info */}
              <div className="mt-5 flex items-center gap-3 border-t border-gray-200/70 pt-4 dark:border-gray-700/60">
                <div className="size-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-xs">
                  {imagePreviewUri ? (
                    <img
                      src={imagePreviewUri}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/Ignitoverse Logonew.png";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-50 font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                      {formData.reviewerName ? formData.reviewerName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {formData.reviewerName || "Reviewer Name"}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.reviewerDesignation || "Role / Designation"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
