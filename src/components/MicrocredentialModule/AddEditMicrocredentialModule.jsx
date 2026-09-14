import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
  TrashBinIcon,
} from "../../icons";
import {
  getStreamData,
  getMicrocredentialCourse,
  microcredentialModuleMasterAddUpdate,
  microcredentialModuleMasterGetById,
  commonUploadFile,
} from "../../services/adminMicrocredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function AddEditMicrocredentialModule() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const moduleId = params.id ? Number(params.id) : 0;
  const isEditMode = Boolean(moduleId && moduleId > 0);

  // Loading and feedback states
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown states
  const [streamList, setStreamList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState(
    location.state?.streamId ? String(location.state.streamId) : ""
  );
  const [selectedCourseId, setSelectedCourseId] = useState(
    location.state?.courseId
      ? String(location.state.courseId)
      : location.state?.item?.microcredentialCourseId
      ? String(location.state.item.microcredentialCourseId)
      : ""
  );

  // Module items state (in edit mode, exactly 1; in add mode, can add multiple)
  const [modules, setModules] = useState([
    {
      microcredentialModuleMasterId: isEditMode ? moduleId : 0,
      moduleName: location.state?.item?.moduleName || "",
      moduleDescription: location.state?.item?.moduleDescription || "",
      moduleBannerImage: location.state?.item?.moduleBannerImage || "",
      bannerFile: null,
      bannerPreviewUrl: location.state?.item?.moduleBannerImage
        ? formatImageUrl(location.state.item.moduleBannerImage)
        : "",
      uploadingBanner: false,
    },
  ]);

  // Load stream list on mount
  useEffect(() => {
    let isMounted = true;
    async function loadStreams() {
      setLoadingStreams(true);
      try {
        const streamRes = await getStreamData();
        if (isMounted && streamRes && streamRes.success) {
          const streams = streamRes.streamDataList || [];
          setStreamList(streams);
        }
      } catch (err) {
        console.error("Error loading stream list:", err);
      } finally {
        if (isMounted) setLoadingStreams(false);
      }
    }
    loadStreams();
    return () => {
      isMounted = false;
    };
  }, []);

  // If stream selected, load courses for that stream
  useEffect(() => {
    if (!selectedStreamId) return;
    let isMounted = true;
    async function loadCourses() {
      setLoadingCourses(true);
      try {
        const res = await getMicrocredentialCourse(selectedStreamId);
        if (isMounted && res && res.success) {
          setCourseList(res.microcredentialCourseOutputList || []);
        } else if (isMounted) {
          setCourseList([]);
        }
      } catch (err) {
        console.error("Error loading courses for stream:", err);
        if (isMounted) setCourseList([]);
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    }
    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [selectedStreamId]);

  // If in edit mode, fetch existing module details
  useEffect(() => {
    if (!isEditMode) return;
    let isMounted = true;

    async function loadModuleDetails() {
      setLoadingDetail(true);
      try {
        const res = await microcredentialModuleMasterGetById(moduleId);
        if (isMounted && res && res.success && res.module) {
          const m = res.module;
          setSelectedCourseId(String(m.microcredentialCourseId || ""));

          setModules([
            {
              microcredentialModuleMasterId: m.microcredentialModuleMasterId || moduleId,
              moduleName: m.moduleName || "",
              moduleDescription: m.moduleDescription || "",
              moduleBannerImage: m.moduleBannerImage || "",
              bannerFile: null,
              bannerPreviewUrl: m.moduleBannerImage ? formatImageUrl(m.moduleBannerImage) : "",
              uploadingBanner: false,
            },
          ]);
        } else if (isMounted && res && !res.success) {
          setErrorMessage(res.message || "Failed to load module details.");
        }
      } catch (err) {
        console.error("Error fetching module by ID:", err);
        if (isMounted) {
          setErrorMessage("Failed to load module details.");
        }
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    }

    loadModuleDetails();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, moduleId]);

  // Stream Change
  const handleStreamChange = (e) => {
    const sId = e.target.value;
    setSelectedStreamId(sId);
    setSelectedCourseId("");
    setCourseList([]);
  };

  // Course Change
  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  // Field change in module list
  const handleModuleFieldChange = (index, field, value) => {
    setModules((prev) =>
      prev.map((mod, i) => (i === index ? { ...mod, [field]: value } : mod))
    );
  };

  // File change for banner image
  const handleBannerFileChange = async (index, file) => {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setModules((prev) =>
      prev.map((mod, i) =>
        i === index
          ? {
              ...mod,
              bannerFile: file,
              bannerPreviewUrl: localUrl,
              uploadingBanner: true,
              bannerUploaded: false,
            }
          : mod
      )
    );

    try {
      let uploadRes = await commonUploadFile(
        file,
        "UploadSource",
        "CourseBannerImage"
      );

      if (!uploadRes?.filePath && !uploadRes?.documentList?.[0]?.filePath && !uploadRes?.rawData?.filePath) {
        uploadRes = await commonUploadFile(
          file,
          "UploadSource",
          "MicrocredentialModuleBannerImage"
        );
      }

      let serverPath = "";
      if (uploadRes?.filePath) {
        serverPath = uploadRes.filePath;
      } else if (uploadRes?.documentList?.[0]?.filePath) {
        serverPath = uploadRes.documentList[0].filePath;
      } else if (Array.isArray(uploadRes?.rawData) && uploadRes.rawData[0]?.filePath) {
        serverPath = uploadRes.rawData[0].filePath;
      } else if (uploadRes?.rawData?.filePath) {
        serverPath = uploadRes.rawData.filePath;
      }

      if (serverPath) {
        setModules((prev) =>
          prev.map((mod, i) =>
            i === index
              ? {
                  ...mod,
                  moduleBannerImage: serverPath,
                  // Retain the local blob URL for instant preview without 404 network errors
                  bannerPreviewUrl: localUrl,
                  uploadingBanner: false,
                  bannerUploaded: true,
                }
              : mod
          )
        );
      } else {
        setModules((prev) =>
          prev.map((mod, i) =>
            i === index
              ? {
                  ...mod,
                  bannerPreviewUrl: localUrl,
                  uploadingBanner: false,
                  bannerUploaded: false,
                }
              : mod
          )
        );
      }
    } catch (err) {
      console.warn("Banner direct upload deferred to submit:", err);
      setModules((prev) =>
        prev.map((mod, i) =>
          i === index
            ? {
                ...mod,
                bannerPreviewUrl: localUrl,
                uploadingBanner: false,
                bannerUploaded: false,
              }
            : mod
        )
      );
    }
  };

  // Remove banner image
  const handleRemoveBanner = (index) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === index
          ? {
              ...mod,
              bannerFile: null,
              bannerPreviewUrl: "",
              moduleBannerImage: "",
              bannerUploaded: false,
            }
          : mod
      )
    );
  };

  // Add another module row (bulk mode)
  const handleAddModuleRow = () => {
    setModules((prev) => [
      ...prev,
      {
        microcredentialModuleMasterId: 0,
        moduleName: "",
        moduleDescription: "",
        moduleBannerImage: "",
        bannerFile: null,
        bannerPreviewUrl: "",
        uploadingBanner: false,
      },
    ]);
  };

  // Remove a module row
  const handleRemoveModuleRow = (index) => {
    if (modules.length === 1) {
      setModules([
        {
          microcredentialModuleMasterId: 0,
          moduleName: "",
          moduleDescription: "",
          moduleBannerImage: "",
          bannerFile: null,
          bannerPreviewUrl: "",
          uploadingBanner: false,
        },
      ]);
      return;
    }
    setModules((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      setErrorMessage("Please select a microcredential course.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const validModules = modules.filter((m) => m.moduleName.trim() !== "");
    if (validModules.length === 0) {
      setErrorMessage("Please enter a Module Name for at least one module.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Ensure banners are uploaded if any pending banner files remain
      const finalModulesList = [];
      for (const mod of validModules) {
        let finalBanner = mod.moduleBannerImage || "";

        if (mod.bannerFile && !mod.bannerUploaded) {
          let uploadRes = await commonUploadFile(
            mod.bannerFile,
            "UploadSource",
            "CourseBannerImage"
          );

          if (!uploadRes?.filePath && !uploadRes?.documentList?.[0]?.filePath && !uploadRes?.rawData?.filePath) {
            uploadRes = await commonUploadFile(
              mod.bannerFile,
              "UploadSource",
              "MicrocredentialModuleBannerImage"
            );
          }

          if (uploadRes?.filePath) {
            finalBanner = uploadRes.filePath;
          } else if (uploadRes?.documentList?.[0]?.filePath) {
            finalBanner = uploadRes.documentList[0].filePath;
          } else if (Array.isArray(uploadRes?.rawData) && uploadRes.rawData[0]?.filePath) {
            finalBanner = uploadRes.rawData[0].filePath;
          } else if (uploadRes?.rawData?.filePath) {
            finalBanner = uploadRes.rawData.filePath;
          }
        }

        finalModulesList.push({
          MicrocredentialModuleMasterId: Number(mod.microcredentialModuleMasterId || 0),
          ModuleName: mod.moduleName.trim(),
          ModuleDescription: mod.moduleDescription.trim(),
          ModuleBannerImage: finalBanner,
        });
      }

      // 2. Prepare payload
      let payload;
      if (isEditMode || finalModulesList.length === 1) {
        // Single module payload
        payload = {
          AdminId: 1,
          MicrocredentialCourseId: Number(selectedCourseId),
          MicrocredentialModuleMasterId: Number(finalModulesList[0].MicrocredentialModuleMasterId || 0),
          ModuleName: finalModulesList[0].ModuleName,
          ModuleDescription: finalModulesList[0].ModuleDescription,
          ModuleBannerImage: finalModulesList[0].ModuleBannerImage,
        };
      } else {
        // Bulk modules payload
        payload = {
          AdminId: 1,
          MicrocredentialCourseId: Number(selectedCourseId),
          MicrocredentialModuleList: finalModulesList,
        };
      }

      const res = await microcredentialModuleMasterAddUpdate(payload);

      if (res && res.success !== false) {
        const msg = res.message || (isEditMode ? "Module updated successfully." : "Modules saved successfully.");
        setSuccessMessage(msg);

        setTimeout(() => {
          navigate("/microcredential/module-list", {
            state: { successMessage: msg },
          });
        }, 1200);
      } else {
        setErrorMessage(
          res?.message || "Failed to save module. Please verify your fields and retry."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error saving module:", err);
      setErrorMessage("An unexpected error occurred while saving module.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${isEditMode ? "Edit" : "Add"} Microcredential Module | IgnitoVerse Admin`}
        description="Add or edit course modules under a microcredential course."
      />
      <PageBreadcrumb
        pageTitle={`${isEditMode ? "Edit" : "Add"} Microcredential Module`}
      />

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Course Selection */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
            Course Association
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Select the Stream and Course that this module belongs to.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stream Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Stream (Optional filter)
              </label>
              <select
                value={selectedStreamId}
                onChange={handleStreamChange}
                disabled={loadingStreams || isEditMode}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Stream to Filter Courses --</option>
                {streamList.map((stream) => (
                  <option key={stream.streamId} value={stream.streamId}>
                    {stream.streamName}
                  </option>
                ))}
              </select>
            </div>

            {/* Microcredential Course Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Microcredential Course <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={handleCourseChange}
                disabled={loadingCourses || isEditMode}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCourses
                    ? "Loading courses..."
                    : selectedStreamId
                    ? "-- Select Microcredential Course --"
                    : "-- Select Stream First or Enter Course ID --"}
                </option>
                {courseList.map((c) => (
                  <option
                    key={c.microcredentialCourseId}
                    value={c.microcredentialCourseId}
                  >
                    {c.microcredentialCourseName}
                  </option>
                ))}
                {/* Fallback if courses list doesn't include the edit course */}
                {selectedCourseId &&
                  !courseList.some(
                    (c) => String(c.microcredentialCourseId) === String(selectedCourseId)
                  ) && (
                    <option value={selectedCourseId}>
                      Course #{selectedCourseId}
                    </option>
                  )}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Modules Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {isEditMode ? "Module Details" : "Modules Configuration"}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isEditMode
                  ? "Update this module's name, description, and banner image."
                  : "You can add a single module or multiple modules at once for this course."}
              </p>
            </div>

            {!isEditMode && (
              <button
                type="button"
                onClick={handleAddModuleRow}
                className="px-3.5 py-2 text-xs font-medium text-[#1D64F2] bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>+ Add Another Module</span>
              </button>
            )}
          </div>

          {modules.map((mod, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 relative transition-all"
            >
              {/* Card Header with count & remove button */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Module #{idx + 1}
                </span>

                {!isEditMode && modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveModuleRow(idx)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                  >
                    <TrashBinIcon className="size-4" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left side: Module Name & Description */}
                <div className="md:col-span-8 space-y-4">
                  {/* Module Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Module Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Module 1: Building RESTful APIs with ASP.NET Core"
                      value={mod.moduleName}
                      onChange={(e) =>
                        handleModuleFieldChange(idx, "moduleName", e.target.value)
                      }
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Module Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Module Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Brief overview of topics, routing, and outcomes covered in this module..."
                      value={mod.moduleDescription}
                      onChange={(e) =>
                        handleModuleFieldChange(
                          idx,
                          "moduleDescription",
                          e.target.value
                        )
                      }
                      className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Right side: Module Banner Image */}
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Module Banner Image
                  </label>

                  {mod.bannerPreviewUrl ? (
                    <div className="relative rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
                      <img
                        src={mod.bannerPreviewUrl}
                        alt="Module Banner Preview"
                        className="w-full h-36 object-cover bg-gray-50 dark:bg-gray-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          if (!mod.bannerFile) {
                            e.target.src = "/Ignitoverse_Logo.png";
                          }
                        }}
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <label
                          className="p-1.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                          title="Change banner image"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBannerFileChange(idx, file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveBanner(idx)}
                          className="p-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors"
                          title="Remove banner image"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 text-xs bg-black/60 text-white rounded">
                        {mod.uploadingBanner ? "Uploading..." : "Banner Attached"}
                      </span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-36 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded-xl cursor-pointer bg-gray-50/50 dark:bg-gray-800/40 hover:bg-blue-50/20 transition-all text-center">
                      <svg
                        className="size-8 text-gray-400 dark:text-gray-500 mb-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-blue-600 hover:underline">
                        Upload Banner
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        PNG, JPG or WebP (max 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) =>
                          handleBannerFileChange(idx, e.target.files?.[0])
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 3: Bottom Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/microcredential/module-list"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#1D64F2] hover:bg-[#1855D1] rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin size-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditMode ? "Update Module" : "Save Module(s)"}</span>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
