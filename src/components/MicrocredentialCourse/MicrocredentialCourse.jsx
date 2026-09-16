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
  TrashBinIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  EyeIcon,
  PencilIcon,
} from "../../icons";
import {
  adminMicrocredentialCourseList,
  microcredentialCourseDelete,
  getMicroCourseMaterialIncludeData,
  getMicroCourseLearnData,
  downloadMicroTemplate,
  uploadMicroCourseExcel,
  microcredentialCourseExcelInsert,
} from "../../services/adminMicrocredentialService";
import { formatImageUrl } from "../../dto/output/homepageOutputs";

export default function MicrocredentialCourse() {
  const navigate = useNavigate();
  const location = useLocation();
  const excelInputRef = React.useRef(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  // Course data and loading states
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStream, setSelectedStream] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "microcredentialCourseName",
    direction: "asc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Field Viewer Modal state (for the 5 icon fields + certificate image)
  // 'about' | 'description' | 'introUrl' | 'materials' | 'learn' | 'certImage'
  const [activeModalType, setActiveModalType] = useState(null);
  const [activeModalCourse, setActiveModalCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [materialsList, setMaterialsList] = useState([]);
  const [learnList, setLearnList] = useState([]);

  // Delete Modal state
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /**
   * Fetch courses from backend API using adminMicrocredentialCourseList with adminId: 1
   */
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await adminMicrocredentialCourseList(
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
          response.microcredentialCourseOutPutList ||
          response.MicrocredentialCourseOutPutList ||
          response.data ||
          [];

        setCourses(Array.isArray(list) ? list : []);
        setTotalRecords(
          response.pageDetail?.totalRecords ||
          response.totalRecords ||
          list.length
        );
      } else {
        setErrorMessage(
          response?.message ||
          response?.errorDescription ||
          "Failed to load microcredential courses."
        );
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching microcredential courses:", err);
      setErrorMessage(err.message || "Failed to load microcredential courses.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Unique stream names & levels for filter dropdowns
  const availableStreams = useMemo(() => {
    const streams = new Set();
    courses.forEach((c) => {
      if (c.streamName && c.streamName.trim()) streams.add(c.streamName.trim());
    });
    return Array.from(streams);
  }, [courses]);

  const availableLevels = useMemo(() => {
    const levels = new Set();
    courses.forEach((c) => {
      if (c.courseLevel && c.courseLevel.trim()) levels.add(c.courseLevel.trim());
    });
    return Array.from(levels);
  }, [courses]);

  // Filtered and sorted data
  const processedCourses = useMemo(() => {
    let result = [...courses];

    if (selectedStream !== "all") {
      result = result.filter(
        (item) => (item.streamName || "").toLowerCase() === selectedStream.toLowerCase()
      );
    }

    if (selectedLevel !== "all") {
      result = result.filter(
        (item) => (item.courseLevel || "").toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = (item.microcredentialCourseName || "").toLowerCase();
        const stream = (item.streamName || "").toLowerCase();
        const level = (item.courseLevel || "").toLowerCase();
        const lang = (item.language || "").toLowerCase();
        const format = (item.microcredentialCourseFormat || "").toLowerCase();
        return (
          name.includes(q) ||
          stream.includes(q) ||
          level.includes(q) ||
          lang.includes(q) ||
          format.includes(q)
        );
      });
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key] ?? "";
        let valB = b[sortConfig.key] ?? "";

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
  }, [courses, selectedStream, selectedLevel, searchQuery, sortConfig]);

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

  const totalItems = processedCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentSafePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentSafePage - 1) * pageSize;
    return processedCourses.slice(start, start + pageSize);
  }, [processedCourses, currentSafePage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentSafePage - 1) * pageSize + 1;
  const endIndex = Math.min(currentSafePage * pageSize, totalItems);

  // ===========================================================================
  // MODAL OPENERS FOR THE 5 ICON COLUMNS + CERTIFICATE IMAGE
  // ===========================================================================
  const handleOpenAbout = (course) => {
    setActiveModalCourse(course);
    setActiveModalType("about");
  };

  const handleOpenDescription = (course) => {
    setActiveModalCourse(course);
    setActiveModalType("description");
  };

  const handleOpenIntroURL = (course) => {
    setActiveModalCourse(course);
    setActiveModalType("introUrl");
  };

  const handleOpenMaterials = async (course) => {
    setActiveModalCourse(course);
    setActiveModalType("materials");
    setModalLoading(true);
    setMaterialsList([]);

    const id = course.microcredentialCourseId || course.MicrocredentialCourseId || 0;
    if (id > 0) {
      try {
        const res = await getMicroCourseMaterialIncludeData(id);
        if (res && res.success && Array.isArray(res.microCourseMaterialIncludeDataList)) {
          setMaterialsList(res.microCourseMaterialIncludeDataList);
        }
      } catch (err) {
        console.warn("Could not load material include data list:", err);
      } finally {
        setModalLoading(false);
      }
    } else {
      setModalLoading(false);
    }
  };

  const handleOpenLearn = async (course) => {
    setActiveModalCourse(course);
    setActiveModalType("learn");
    setModalLoading(true);
    setLearnList([]);

    const id = course.microcredentialCourseId || course.MicrocredentialCourseId || 0;
    if (id > 0) {
      try {
        const res = await getMicroCourseLearnData(id);
        if (res && res.success && Array.isArray(res.microCourseLearnDataList)) {
          setLearnList(res.microCourseLearnDataList);
        }
      } catch (err) {
        console.warn("Could not load learn data list:", err);
      } finally {
        setModalLoading(false);
      }
    } else {
      setModalLoading(false);
    }
  };

  const handleOpenCertImage = (course) => {
    setActiveModalCourse(course);
    setActiveModalType("certImage");
  };

  const handleCloseActiveModal = () => {
    setActiveModalType(null);
    setActiveModalCourse(null);
    setMaterialsList([]);
    setLearnList([]);
  };

  // ===========================================================================
  // NAVIGATION TO DEDICATED ADD / EDIT PAGES
  // ===========================================================================
  const handleGoToAddCourse = () => {
    navigate("/microcredential/course-add");
  };

  const handleGoToEditCourse = (course) => {
    const courseId =
      course.microcredentialCourseId ||
      course.MicrocredentialCourseId ||
      0;
    navigate(`/microcredential/course-edit/${courseId}`, {
      state: { item: course },
    });
  };

  // ===========================================================================
  // EXCEL TEMPLATE DOWNLOAD & BULK UPLOAD
  // ===========================================================================
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    setErrorMessage("");
    try {
      await downloadMicroTemplate(true);
      setSuccessMessage("Microcredential course template downloaded successfully.");
    } catch (err) {
      console.error("Error downloading template:", err);
      setErrorMessage(err.message || "Failed to download Excel template.");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleTriggerExcelUpload = () => {
    if (excelInputRef.current) {
      excelInputRef.current.value = "";
      excelInputRef.current.click();
    }
  };

  const handleUploadExcelFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMessage("Please select a valid Excel file (.xlsx or .xls).");
      return;
    }

    setUploadingExcel(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Upload Excel file to parse data
      const uploadRes = await uploadMicroCourseExcel(file);
      if (uploadRes && uploadRes.success !== false) {
        // 2. Insert bulk parsed courses
        const insertPayload = {
          AdminId: 1,
          MicroCourseExcelDataList:
            uploadRes.microCourseExcelDataList ||
            uploadRes.rawData?.microCourseExcelDataList ||
            [],
          MicroCourseLearnList:
            uploadRes.microCourseLearnList ||
            uploadRes.rawData?.microCourseLearnList ||
            [],
          MaterialIncludeList:
            uploadRes.materialIncludeList ||
            uploadRes.rawData?.materialIncludeList ||
            [],
        };

        const insertRes = await microcredentialCourseExcelInsert(insertPayload);
        if (insertRes && insertRes.success !== false) {
          setSuccessMessage(
            insertRes.message || "Bulk microcredential courses uploaded and added successfully!"
          );
          fetchCourses();
        } else {
          throw new Error(insertRes?.message || "Failed to insert courses from Excel.");
        }
      } else {
        throw new Error(uploadRes?.message || "Failed to parse Excel file.");
      }
    } catch (err) {
      console.error("Error uploading courses excel:", err);
      setErrorMessage(err.message || "Failed to process course Excel file.");
    } finally {
      setUploadingExcel(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  // ===========================================================================
  // DELETE COURSE
  // ===========================================================================
  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return;

    const courseId =
      deleteModalItem.microcredentialCourseId ||
      deleteModalItem.MicrocredentialCourseId ||
      0;

    setDeleting(true);
    try {
      const res = await microcredentialCourseDelete(courseId, 1);
      if (res && res.success !== false) {
        setSuccessMessage(res.message || "Microcredential course deleted successfully.");
        setCourses((prev) =>
          prev.filter((c) => (c.microcredentialCourseId || c.MicrocredentialCourseId) !== courseId)
        );
      } else {
        setErrorMessage(res?.message || res?.errorDescription || "Failed to delete course.");
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      setErrorMessage(err.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
      setDeleteModalItem(null);
    }
  };

  // Helper for status badge
  const renderStatusBadge = (status) => {
    const cleanStatus = (status || "").toLowerCase().trim();
    const isActive =
      cleanStatus === "active" ||
      cleanStatus === "published" ||
      cleanStatus === "1" ||
      cleanStatus === "true";

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${isActive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
      >
        <span
          className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"
            }`}
        />
        {status || (isActive ? "Active" : "Inactive")}
      </span>
    );
  };

  // Helper for Level badge
  const renderLevelBadge = (level) => {
    if (!level) return <span className="text-gray-400 text-xs">—</span>;
    const l = level.toLowerCase();
    let colorClasses = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40";
    if (l.includes("intermed")) {
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40";
    } else if (l.includes("advanc")) {
      colorClasses = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40";
    }

    return (
      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${colorClasses}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="w-full">
      <PageMeta
        title="Microcredential Courses | Ignitoverse Admin"
        description="Manage industry-certified microcredential courses, streams, pricing, and curriculum details"
      />
      <PageBreadcrumb pageTitle="Microcredential Course List" />

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
      )}      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Hidden File Input for Excel Bulk Upload */}
        <input
          type="file"
          ref={excelInputRef}
          onChange={handleUploadExcelFile}
          accept=".xlsx, .xls"
          className="hidden"
        />

        {/* Row 1: Top Action Buttons aligned to the right */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-gray-100 p-5 dark:border-white/[0.05]">
          {/* Mild Red / Rose Button: Add New Microcredential Course */}
          <button
            type="button"
            onClick={handleGoToAddCourse}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/90 px-4 py-2 text-xs font-semibold text-red-700 shadow-xs hover:border-red-300 hover:bg-red-100 active:scale-95 transition dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Microcredential Course</span>
          </button>

          {/* Mild Green / Emerald Button: Download Microcredential Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-xs hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60 active:scale-95 transition dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
            <span>
              {downloadingTemplate ? "Downloading..." : "Download Microcredential Template"}
            </span>
          </button>

          {/* Mild Blue Button: Upload Microcredential Excel */}
          <button
            type="button"
            onClick={handleTriggerExcelUpload}
            disabled={uploadingExcel}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-2 text-xs font-semibold text-blue-700 shadow-xs hover:border-blue-300 hover:bg-blue-100 disabled:opacity-60 active:scale-95 transition dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{uploadingExcel ? "Processing Excel..." : "Upload Microcredential Excel"}</span>
          </button>
        </div>

        {/* Row 2: Search Box & Filters */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          {/* Stream & Level Filters */}
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

            {availableLevels.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>Level:</span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="all">All Levels</option>
                  {availableLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchCourses}
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
              placeholder="Search..."
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

        {/* Courses Table Container */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.02]">
              <TableRow>
                {/* 1. Sr No */}
                <TableCell
                  isHeader
                  className="w-14 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Sr No.
                </TableCell>

                {/* 2. Course Name & Stream */}
                <TableCell
                  isHeader
                  className="min-w-[200px] cursor-pointer px-4 py-3.5 text-start text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("microcredentialCourseName")}
                >
                  <div className="flex items-center gap-1">
                    <span>Course & Stream</span>
                    {sortConfig.key === "microcredentialCourseName" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 3. Certificate Image */}
                <TableCell
                  isHeader
                  className="w-24 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Certificate Image
                </TableCell>

                {/* 4. About Course */}


                {/* 9. Level & Lang */}
                <TableCell
                  isHeader
                  className="min-w-[120px] px-3 py-3.5 text-start text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Level / Lang
                </TableCell>

                {/* 10. Duration & Format */}
                <TableCell
                  isHeader
                  className="min-w-[120px] px-3 py-3.5 text-start text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Duration / Format
                </TableCell>

                {/* 11. Price & Rating */}
                <TableCell
                  isHeader
                  className="min-w-[110px] cursor-pointer px-3 py-3.5 text-start text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                  onClick={() => handleSort("microcredentialCoursePrice")}
                >
                  <div className="flex items-center gap-1">
                    <span>Price & Rating</span>
                    {sortConfig.key === "microcredentialCoursePrice" && (
                      <span className="text-brand-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 12. Status */}
                <TableCell
                  isHeader
                  className="w-24 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="w-28 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  About Course
                </TableCell>

                {/* 5. Course Description */}
                <TableCell
                  isHeader
                  className="w-32 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Course Description
                </TableCell>

                {/* 6. Course Intro URL */}
                <TableCell
                  isHeader
                  className="w-28 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Course Intro URL
                </TableCell>

                {/* 7. Material Include */}
                <TableCell
                  isHeader
                  className="w-28 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Material Include
                </TableCell>

                {/* 8. Microcredential Learn */}
                <TableCell
                  isHeader
                  className="w-36 px-3 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Microcredential Learn
                </TableCell>

                {/* 13. Action */}
                <TableCell
                  isHeader
                  className="w-24 px-4 py-3.5 text-center text-theme-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && courses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="py-14 text-center text-theme-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                      <span>Loading microcredential courses...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="py-14 text-center text-theme-sm text-gray-500 dark:text-gray-400"
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
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                          <path d="M6 6h10" />
                          <path d="M6 10h10" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {searchQuery ? "No matching courses found" : "No microcredential courses found"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {searchQuery
                          ? "Try adjusting your search query or filters"
                          : "Courses will appear here once configured"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((course, index) => {
                  const serialNo = (currentSafePage - 1) * pageSize + index + 1;
                  const introImageUrl = formatImageUrl(course.microcredentialCourseIntroImage);
                  const certImageUrl = formatImageUrl(course.certificateImage);
                  const price = Number(course.microcredentialCoursePrice || 0);
                  const rating = Number(course.microcredentialCourseRating || 0);

                  return (
                    <TableRow
                      key={course.microcredentialCourseId || index}
                      className="hover:bg-gray-50/75 dark:hover:bg-white/[0.02]"
                    >
                      {/* 1. Sr No */}
                      <TableCell className="px-3 py-4 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                        {serialNo}
                      </TableCell>

                      {/* 2. Course Name & Stream */}
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {introImageUrl ? (
                            <img
                              src={introImageUrl}
                              alt={course.microcredentialCourseName || "Course"}
                              className="size-11 shrink-0 rounded-lg border border-gray-200 object-cover p-0.5 shadow-xs dark:border-gray-700"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/newlg.png";
                              }}
                            />
                          ) : (
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 font-bold text-xs dark:bg-brand-950/40 dark:text-brand-400">
                              {(course.microcredentialCourseName || "C").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4
                              className="font-semibold text-theme-sm text-gray-800 line-clamp-2 dark:text-white"
                              title={course.microcredentialCourseName}
                            >
                              {course.microcredentialCourseName || "Untitled Course"}
                            </h4>
                            {course.streamName && (
                              <span className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {course.streamName}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* 3. Certificate Image */}
                      <TableCell className="px-3 py-4 text-center">
                        {certImageUrl ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCertImage(course)}
                            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-xs hover:border-brand-500 dark:border-gray-700 dark:bg-gray-800"
                            title="Click to view certificate"
                          >
                            <img
                              src={certImageUrl}
                              alt="Certificate"
                              className="size-9 object-contain transition group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* 4. About Course (Blue circular eye icon button) */}

                      {/* 9. Level & Language */}
                      <TableCell className="px-3 py-4">
                        <div className="flex flex-col gap-1">
                          <div>{renderLevelBadge(course.courseLevel)}</div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {course.language || "English"}
                          </span>
                        </div>
                      </TableCell>

                      {/* 10. Duration & Format */}
                      <TableCell className="px-3 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-theme-xs font-semibold text-gray-800 dark:text-gray-200">
                            {course.microcredentialCourseDuration || "Self-Paced"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {course.microcredentialCourseFormat || "Online"}
                          </span>
                        </div>
                      </TableCell>

                      {/* 11. Price & Rating */}
                      <TableCell className="px-3 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-theme-xs font-bold text-gray-900 dark:text-white">
                            {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "Free"}
                          </span>
                          {rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-amber-500">
                              <span>★</span>
                              <span className="font-semibold">{rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* 12. Status */}
                      <TableCell className="px-3 py-4 text-center">
                        {renderStatusBadge(course.courseStatus)}
                      </TableCell>
                      <TableCell className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenAbout(course)}
                          className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                          title="View About Course"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>

                      {/* 5. Course Description (Blue circular eye icon button) */}
                      <TableCell className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDescription(course)}
                          className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                          title="View Course Description"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>

                      {/* 6. Course Intro URL (Blue circular eye icon button) */}
                      <TableCell className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenIntroURL(course)}
                          className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                          title="View Course Intro URL"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>

                      {/* 7. Material Include (Blue circular eye icon button) */}
                      <TableCell className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenMaterials(course)}
                          className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                          title="View Materials Included"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>

                      {/* 8. Microcredential Learn (Blue circular eye icon button) */}
                      <TableCell className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenLearn(course)}
                          className="inline-flex size-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs hover:bg-blue-600 active:scale-95 transition-all"
                          title="View What You'll Learn"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>


                      {/* 13. Action (Red Edit Pencil + Dark Delete Trash buttons) */}
                      <TableCell className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button - Red circular icon button */}
                          <button
                            type="button"
                            onClick={() => handleGoToEditCourse(course)}
                            className="inline-flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 active:scale-95 transition-all"
                            title="Edit Course"
                          >
                            <PencilIcon className="size-3.5 fill-white text-white" />
                          </button>

                          {/* Delete Button - Dark circular icon button */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalItem(course)}
                            className="inline-flex size-7 items-center justify-center rounded-full bg-gray-800 text-white shadow-xs hover:bg-black active:scale-95 transition-all dark:bg-gray-700 dark:hover:bg-gray-600"
                            title="Delete Course"
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

        {/* Footer Bar below Table with Show entries, Refresh, Total Count, and Pagination */}
        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.05]">
          {/* Left: Show entries & Total count */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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

            <div className="text-theme-xs text-gray-500 dark:text-gray-400">
              Total Courses:{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {totalRecords || totalItems}
              </span>
            </div>
          </div>

          {/* Right: Pagination Info & Controls */}
          {totalItems > 0 && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="text-theme-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-700 dark:text-white">{startIndex}</span> to{" "}
                <span className="font-semibold text-gray-700 dark:text-white">{endIndex}</span> of{" "}
                <span className="font-semibold text-gray-700 dark:text-white">{totalItems}</span> entries
              </div>

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
      {/* 1. FIELD DETAILS MODAL (About, Description, Intro URL, Materials, Learn) */}
      {/* ======================================================================= */}
      {activeModalType && activeModalCourse && (
        <div
          className="fixed inset-0 z-999999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={handleCloseActiveModal}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  {activeModalType === "about" && "About Course"}
                  {activeModalType === "description" && "Course Description"}
                  {activeModalType === "introUrl" && "Course Intro URL"}
                  {activeModalType === "materials" && "Material Included"}
                  {activeModalType === "learn" && "Microcredential Learn"}
                  {activeModalType === "certImage" && "Certificate Preview"}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">
                  {activeModalCourse.microcredentialCourseName}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseActiveModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 text-xs text-gray-700 dark:text-gray-300">
              {/* About Course */}
              {activeModalType === "about" && (
                <div className="rounded-xl bg-gray-50 p-4 leading-relaxed whitespace-pre-line dark:bg-gray-800/40">
                  {activeModalCourse.aboutMicrocredentialCourse || (
                    <span className="italic text-gray-400">No about information provided for this course.</span>
                  )}
                </div>
              )}

              {/* Course Description */}
              {activeModalType === "description" && (
                <div className="max-h-96 overflow-y-auto rounded-xl bg-gray-50 p-4 leading-relaxed whitespace-pre-line dark:bg-gray-800/40">
                  {activeModalCourse.microcredentialCourseDescription || (
                    <span className="italic text-gray-400">No description provided for this course.</span>
                  )}
                </div>
              )}

              {/* Course Intro URL */}
              {activeModalType === "introUrl" && (() => {
                const introUrl =
                  activeModalCourse.microcredentialCourseIntroURL ||
                  activeModalCourse.MicrocredentialCourseIntroURL ||
                  activeModalCourse.microcredentialCourseIntroUrl ||
                  activeModalCourse.MicrocredentialCourseIntroUrl ||
                  activeModalCourse.introURL ||
                  activeModalCourse.introUrl ||
                  activeModalCourse.IntroURL ||
                  activeModalCourse.IntroUrl ||
                  activeModalCourse.courseIntroURL ||
                  activeModalCourse.courseIntroUrl ||
                  activeModalCourse.CourseIntroURL ||
                  activeModalCourse.CourseIntroUrl ||
                  "";

                return (
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/40">
                    {introUrl ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-700 dark:text-gray-300">
                            Introduction Video / URL:
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              handleCloseActiveModal();
                              handleGoToEditCourse(activeModalCourse);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
                          >
                            <PencilIcon className="size-3" />
                            <span>Edit URL</span>
                          </button>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                          <p className="break-all font-mono text-xs text-brand-600 dark:text-brand-400">
                            {introUrl}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={introUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
                          >
                            <span>Open URL in New Tab</span>
                            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center">
                        <p className="italic text-gray-400">No introduction URL configured for this course.</p>
                        <button
                          type="button"
                          onClick={() => {
                            handleCloseActiveModal();
                            handleGoToEditCourse(activeModalCourse);
                          }}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                        >
                          <PencilIcon className="size-3 fill-white text-white" />
                          <span>Add Introduction URL</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Material Include */}
              {activeModalType === "materials" && (
                <div className="space-y-3">
                  {activeModalCourse.microcredentialCourseMaterialInclude && (
                    <div className="rounded-xl bg-gray-50 p-4 leading-relaxed dark:bg-gray-800/40">
                      <p className="font-semibold text-gray-800 dark:text-white mb-1">Included in Course:</p>
                      <p>{activeModalCourse.microcredentialCourseMaterialInclude}</p>
                    </div>
                  )}

                  {modalLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
                      <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span>Loading materials...</span>
                    </div>
                  ) : materialsList.length > 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/60">
                      <p className="font-semibold text-gray-800 dark:text-white mb-2">Itemized Materials ({materialsList.length}):</p>
                      <ul className="space-y-1.5">
                        {materialsList.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span>{item.materialInclude}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : !activeModalCourse.microcredentialCourseMaterialInclude ? (
                    <span className="italic text-gray-400">No materials configured for this course.</span>
                  ) : null}
                </div>
              )}

              {/* Microcredential Learn */}
              {activeModalType === "learn" && (
                <div>
                  {modalLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
                      <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span>Loading learning outcomes...</span>
                    </div>
                  ) : learnList.length > 0 ? (
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/40">
                      <p className="font-bold text-gray-800 dark:text-white mb-3">Key Learnings ({learnList.length}):</p>
                      <ul className="space-y-2">
                        {learnList.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] dark:bg-emerald-950/50 dark:text-emerald-400">
                              ✓
                            </span>
                            <span className="leading-relaxed">{item.microCourseLearn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-400 dark:bg-gray-800/40">
                      <span>No learning points configured for this course yet.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Certificate Image Preview */}
              {activeModalType === "certImage" && (
                <div className="flex flex-col items-center justify-center gap-3 p-2">
                  <img
                    src={formatImageUrl(activeModalCourse.certificateImage)}
                    alt="Certificate"
                    className="max-h-72 max-w-full rounded-xl border border-gray-200 object-contain shadow-xs dark:border-gray-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/newlg.png";
                    }}
                  />
                  {activeModalCourse.certificateName && (
                    <p className="font-semibold text-gray-800 dark:text-white text-center">
                      {activeModalCourse.certificateName}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-5 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                type="button"
                onClick={handleCloseActiveModal}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. DELETE CONFIRMATION MODAL                                            */}
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
                Delete Course
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
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                "{deleteModalItem.microcredentialCourseName || "this course"}"
              </span>
              ? This action cannot be undone.
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
