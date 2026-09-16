import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../ui/table";
import { PencilIcon, CloseIcon, CheckCircleIcon, AlertIcon } from "../../icons";
import {
  getAdminHomePageList,
  getHomePageById,
  addUpdateHomePageDetail,
  uploadHomePageFile,
} from "../../services/AdminHomePageServices";
import { formatImageUrl } from "../../dto/output/adminHomePageOutputs";

export default function HerosectionList() {
  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Home page root data and hero section (only ONE hero section displayed)
  const [homePageId, setHomePageId] = useState(1);
  const [fullHomePageData, setFullHomePageData] = useState(null);
  const [heroSection, setHeroSection] = useState({
    homeTitle: "",
    homeSlogan: "",
    homeBannerImage: "",
    homeDescription: "",
  });

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    homeTitle: "",
    homeSlogan: "",
    homeBannerImage: "",
    homeDescription: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUri, setPreviewImageUri] = useState("");

  /**
   * Fetches the Home Page data and extracts the single primary hero section.
   * API: 1. POST /api/HomePageAPI/HomePageList
   *      2. POST /api/HomePageAPI/HomePageGetById
   */
  const fetchHeroSectionData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Fetch home page list to discover the active homePageId
      const listResponse = await getAdminHomePageList({ pageNo: 1, pageSize: 10 });
      const firstEntry = listResponse?.homePageList?.[0];
      const targetHomePageId = firstEntry?.homePageId || 1;
      setHomePageId(targetHomePageId);

      // 2. Fetch full details for this home page record
      const detailResponse = await getHomePageById(targetHomePageId, 1);
      const detail = detailResponse?.homePageData || detailResponse?.rawData?.data || detailResponse?.rawData || {};
      setFullHomePageData(detail);

      // Extract the first hero slider (only ONE hero section as requested)
      const sliders = detail?.getHomePageList || detail?.homePageList || [];
      const firstSlider = Array.isArray(sliders) && sliders.length > 0 ? sliders[0] : null;

      if (firstSlider) {
        setHeroSection({
          homeTitle: firstSlider.homeTitle || firstSlider.HomeTitle || "",
          homeSlogan: firstSlider.homeSlogan || firstSlider.HomeSlogan || "",
          homeBannerImage: firstSlider.homeBannerImage || firstSlider.HomeBannerImage || "",
          homeDescription: firstSlider.homeDescription || firstSlider.HomeDescription || "",
        });
      } else {
        // Fallback to second banner fields if slider array is not populated
        setHeroSection({
          homeTitle: detail?.homeTitleTwo || "",
          homeSlogan: detail?.homeSloganTwo || "",
          homeBannerImage: detail?.homeBannerImageTwo || "",
          homeDescription: detail?.homeDescriptionTwo || "",
        });
      }
    } catch (err) {
      console.error("Failed to load hero section:", err);
      setErrorMessage(err.message || "Failed to load hero section data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroSectionData();
  }, [fetchHeroSectionData]);

  /**
   * Opens the Edit Modal and initializes form values.
   */
  const handleOpenEditModal = () => {
    setFormData({
      homeTitle: heroSection.homeTitle || "",
      homeSlogan: heroSection.homeSlogan || "",
      homeBannerImage: heroSection.homeBannerImage || "",
      homeDescription: heroSection.homeDescription || "",
    });
    setSelectedFile(null);
    setPreviewImageUri(heroSection.homeBannerImage ? formatImageUrl(heroSection.homeBannerImage) : "");
    setErrorMessage("");
    setIsEditModalOpen(true);
  };

  /**
   * Handles local image file selection for the banner.
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)/i)) {
      setErrorMessage("Please select a valid image file (.jpg, .jpeg, .png, .webp).");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewImageUri(objectUrl);
    setErrorMessage("");
  };

  /**
   * Submits the updated Hero Section via API.
   * 1. If a new image was chosen, uploads it via POST /api/AdminCommonAPI/CommonUploadFile
   * 2. Saves the full record via POST /api/HomePageAPI/HomePageDetailAddUpdate
   */
  const handleSaveHeroSection = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let finalBannerPath = formData.homeBannerImage;

      // 1. Upload new image if selected
      if (selectedFile) {
        setUploadingImage(true);
        const uploadRes = await uploadHomePageFile(
          selectedFile,
          "HomeBannerImage",
          heroSection.homeBannerImage || ""
        );

        if (uploadRes?.filePath) {
          finalBannerPath = uploadRes.filePath;
        } else if (uploadRes?.fileList?.[0]?.filePath) {
          finalBannerPath = uploadRes.fileList[0].filePath;
        } else {
          throw new Error(uploadRes?.message || "Failed to upload banner image file.");
        }
        setUploadingImage(false);
      }

      // 2. Prepare payload preserving existing sections while enforcing ONLY ONE hero section
      const payload = {
        ...(fullHomePageData || {}),
        AdminId: Number(fullHomePageData?.adminId || 1),
        HomePageId: Number(homePageId || 1),
        // Enforce exactly one hero slider as requested
        HomePageList: [
          {
            HomeSlogan: formData.homeSlogan.trim(),
            HomeTitle: formData.homeTitle.trim(),
            HomeBannerImage: finalBannerPath,
            HomeDescription: formData.homeDescription.trim(),
          },
        ],
      };

      // 3. Save via AddUpdate API
      const updateRes = await addUpdateHomePageDetail(payload);

      if (updateRes?.success || updateRes?.isSuccess) {
        setSuccessMessage(updateRes?.message || "Hero section updated successfully!");
        setHeroSection({
          homeTitle: formData.homeTitle.trim(),
          homeSlogan: formData.homeSlogan.trim(),
          homeBannerImage: finalBannerPath,
          homeDescription: formData.homeDescription.trim(),
        });
        setIsEditModalOpen(false);

        // Auto-dismiss success notification after 4 seconds
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        throw new Error(updateRes?.message || "Failed to update hero section.");
      }
    } catch (err) {
      console.error("Save hero section error:", err);
      setErrorMessage(err.message || "An error occurred while saving the hero section.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const getFileName = (path) => {
    if (!path) return "No file selected";
    return path.split("/").pop() || path;
  };

  return (
    <div className="w-full">
      <PageMeta
        title="Hero Section | IgnitoVerse Admin"
        description="Manage the primary homepage hero section with title, slogan, description and banner image."
      />
      <PageBreadcrumb pageTitle="Hero Section Management" />

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

      {/* Hero Section Container */}
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Main Hero Section
              </h2>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
                Single Section Mode
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This is the single primary hero banner displayed at the very top of the learner homepage.
            </p>
          </div>

          {/* Edit Action Button ONLY (No Delete, No Add) */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PencilIcon className="size-4" />
            <span>Edit Hero Section</span>
          </button>
        </div>

        {/* Live Frontend Preview Card */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900">
          {/* Subtle decorative background gradient accents */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-brand-500/5 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-blue-500/5 blur-3xl" />

          {/* Content Layout */}
          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Details */}
            <div className="space-y-4 lg:col-span-7">
              {/* Slogan Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-xs font-semibold text-brand-600 dark:border-brand-900/50 dark:bg-brand-950/50 dark:text-brand-400">
                <span className="size-2 rounded-full bg-brand-500 animate-pulse" />
                <span>{heroSection.homeSlogan || "Welcome to IgnitoLearn"}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                {heroSection.homeTitle || "Empower Your Learning Journey"}
              </h1>

              {/* Description */}
              <p className="max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {heroSection.homeDescription ||
                  "Access comprehensive learning modules, explore curated certifications, and master new skills at your own pace."}
              </p>

              {/* Action Buttons in Banner */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-600 active:scale-[0.98]"
                >
                  <PencilIcon className="size-3.5" />
                  <span>Edit Banner Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  disabled={!heroSection.homeBannerImage}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 hover:text-brand-600 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span>View Full Image</span>
                </button>
              </div>
            </div>

            {/* Right Column: Visual Banner Preview Card */}
            <div className="flex justify-center lg:col-span-5 lg:justify-end">
              <div
                onClick={() => heroSection.homeBannerImage && setIsPreviewModalOpen(true)}
                className="group relative w-full max-w-md cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-2 shadow-xs transition-all hover:border-brand-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60"
              >
                <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                  <img
                    src={formatImageUrl(heroSection.homeBannerImage)}
                    alt="Hero Banner Image Preview"
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105 sm:h-56"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/newlgnew.png";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                      Click to Zoom
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 pt-2.5 pb-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Live Hero Banner</span>
                  <span className="text-[11px] text-brand-500">Preview Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Data Table (Single Record) */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
              Hero Section Attributes
            </h3>

          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Banner Preview
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Slogan
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Title
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Description
                  </TableCell>
                  <TableCell isHeader className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-gray-500">
                      <div className="inline-flex items-center gap-2">
                        <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                        <span>Loading hero section...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow className="border-b border-gray-100 dark:border-gray-800/60">
                    {/* 1. Banner Preview */}
                    <TableCell className="px-6 py-4">
                      <div
                        onClick={() => heroSection.homeBannerImage && setIsPreviewModalOpen(true)}
                        className="size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-xs transition hover:opacity-90 dark:border-gray-700 dark:bg-gray-800"
                        title="Click to zoom image"
                      >
                        <img
                          src={formatImageUrl(heroSection.homeBannerImage)}
                          alt="Banner Thumbnail"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/newlg.png";
                          }}
                        />
                      </div>
                    </TableCell>

                    {/* 2. Slogan */}
                    <TableCell className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {heroSection.homeSlogan || "—"}
                      </span>
                    </TableCell>

                    {/* 3. Title */}
                    <TableCell className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                      <span className="line-clamp-2 max-w-xs text-sm">
                        {heroSection.homeTitle || "—"}
                      </span>
                    </TableCell>

                    {/* 4. Description */}
                    <TableCell className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="line-clamp-2 max-w-sm">
                        {heroSection.homeDescription || "—"}
                      </span>
                    </TableCell>

                    {/* 5. Action: ONLY Edit */}
                    <TableCell className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={handleOpenEditModal}
                        title="Edit Hero Section"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-brand-400"
                      >
                        <PencilIcon className="size-3.5" />
                        <span>Edit</span>
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* EDIT HERO SECTION MODAL                                                 */}
      {/* ======================================================================= */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => !saving && setIsEditModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white">
                  Edit Hero Section
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Update the primary headline, slogan, description and banner image.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !saving && setIsEditModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveHeroSection} className="mt-5 space-y-5">
              {/* Slogan */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Hero Slogan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Welcome to IgnitoLearn"
                  value={formData.homeSlogan}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, homeSlogan: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Hero Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Empower Your Learning Journey"
                  value={formData.homeTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, homeTitle: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Hero Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write a concise overview of the platform offerings..."
                  value={formData.homeDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, homeDescription: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Banner Image Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Hero Banner Image
                </label>

                {/* Current or Selected Image Preview */}
                {previewImageUri ? (
                  <div className="relative mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                    <img
                      src={previewImageUri}
                      alt="Banner Preview"
                      className="max-h-48 w-full rounded-lg object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/newlg.png";
                      }}
                    />
                    <div className="mt-2 flex items-center justify-between px-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="truncate">
                        {selectedFile ? selectedFile.name : getFileName(formData.homeBannerImage)}
                      </span>
                      {selectedFile && (
                        <span className="text-brand-500 font-medium">New file selected</span>
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Choose Banner Image (.jpg, .png)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formData.homeBannerImage && !selectedFile && (
                    <span className="truncate text-xs text-gray-400">
                      Using saved image path
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{uploadingImage ? "Uploading Image..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* IMAGE PREVIEW LIGHTBOX MODAL                                            */}
      {/* ======================================================================= */}
      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div
            className="relative max-w-3xl overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-semibold text-white">
                Banner Image Preview
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center overflow-hidden rounded-xl bg-black/50 p-2">
              <img
                src={formatImageUrl(heroSection.homeBannerImage)}
                alt="Banner Zoom View"
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/newlg.png";
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span className="truncate font-mono">{heroSection.homeBannerImage}</span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
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

export { HerosectionList as HeroSectionList };
