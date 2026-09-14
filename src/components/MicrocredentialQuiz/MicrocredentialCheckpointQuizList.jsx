import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  EyeIcon,
  TrashBinIcon,
  PlusIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  AngleRightIcon as ChevronRightIcon,
  CheckCircleIcon,
  AlertIcon,
  VideoIcon
} from "../../icons";
import {
  fetchMicroCourseTopicList,
  getMicroCourseCheckpointQuizTopicDetail,
  getMicrocredentialCheckpointQuizData,
  deleteMicrocredentialCheckpointQuizByCourseId,
  deleteMicrocredentialCheckpointQuizByYoutubeDataMasterId,
  getMicrocredentialVideoDetailsByCourseId,
  generateMicrocredentialCheckpointQuiz,
  getStreamsDropdown,
  getMicrocredentialCoursesByStream
} from "../../services/AdminQuizPageService";

export default function MicrocredentialCheckpointQuizList() {
  // Main table states
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Topic detail modal state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [selectedCourseForTopics, setSelectedCourseForTopics] = useState(null);
  const [topicDetails, setTopicDetails] = useState([]);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState("");

  // Checkpoint Quiz Question Preview Modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedVideoForPreview, setSelectedVideoForPreview] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Add Checkpoint Quiz Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [streamList, setStreamList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [availableVideos, setAvailableVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [addModalError, setAddModalError] = useState("");

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: "", // "course" | "video"
    id: null,
    title: "",
    loading: false
  });

  // 1. Fetch Main Course Topic List
  const loadCourseTopics = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetchMicroCourseTopicList({
        pageNo: currentPage,
        pageSize: pageSize,
        orderByColumn: "UpdatedOn",
        orderByDirection: "DESC",
        searchInput: searchTerm.trim()
      });

      if (res?.success && Array.isArray(res.microCourseTopicList)) {
        setCoursesList(res.microCourseTopicList);
        setTotalRecords(res.pageDetail?.totalRecords ?? res.microCourseTopicList.length);
      } else {
        setCoursesList([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Failed to load checkpoint courses:", err);
      setErrorMessage(err.message || "Failed to load checkpoint courses.");
      setCoursesList([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    loadCourseTopics();
  }, [loadCourseTopics]);

  // Clear banners
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  // 2. Open Topic Details Modal
  const handleOpenTopicModal = async (course) => {
    setSelectedCourseForTopics(course);
    setIsTopicModalOpen(true);
    setTopicLoading(true);
    setTopicError("");
    setTopicDetails([]);

    try {
      const res = await getMicroCourseCheckpointQuizTopicDetail(course.microcredentialCourseId);
      if (res?.success && Array.isArray(res.getMicroCourseCheckpointQuizTopicDetail)) {
        setTopicDetails(res.getMicroCourseCheckpointQuizTopicDetail);
      } else {
        setTopicDetails([]);
      }
    } catch (err) {
      console.error("Failed to load topic details:", err);
      setTopicError(err.message || "Failed to load topics.");
      setTopicDetails([]);
    } finally {
      setTopicLoading(false);
    }
  };

  // 3. Open Checkpoint Quiz Question Preview
  const handleOpenPreviewModal = async (video) => {
    setSelectedVideoForPreview(video);
    setIsPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewError("");
    setQuizQuestions([]);

    try {
      const res = await getMicrocredentialCheckpointQuizData(video.microcreditYoutubeDataMasterId);
      if (res?.success && Array.isArray(res.getMicrocredentialCheckpointQuizDataList)) {
        setQuizQuestions(res.getMicrocredentialCheckpointQuizDataList);
      } else {
        setQuizQuestions([]);
      }
    } catch (err) {
      console.error("Failed to preview checkpoint quiz:", err);
      setPreviewError(err.message || "Failed to load checkpoint questions.");
      setQuizQuestions([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 4. Open Add Checkpoint Quiz Modal
  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setAddModalError("");
    setSelectedStreamId("");
    setSelectedCourseId("");
    setSelectedVideoId("");
    setAvailableCourses([]);
    setAvailableVideos([]);

    try {
      setAddLoading(true);
      const res = await getStreamsDropdown();
      const list = res?.streamDataList || res?.streams || [];
      if (Array.isArray(list) && list.length > 0) {
        setStreamList(list);
      } else {
        setStreamList([]);
      }
    } catch (err) {
      console.error("Failed to fetch streams:", err);
      setStreamList([]);
    } finally {
      setAddLoading(false);
    }
  };

  // On Stream change in Add Modal
  const handleStreamChange = async (streamId) => {
    setSelectedStreamId(streamId);
    setSelectedCourseId("");
    setSelectedVideoId("");
    setAvailableCourses([]);
    setAvailableVideos([]);

    if (!streamId) return;

    try {
      setAddLoading(true);
      const res = await getMicrocredentialCoursesByStream(streamId);
      if (res?.success && Array.isArray(res.courses)) {
        setAvailableCourses(res.courses);
      } else {
        setAvailableCourses([
          { microcredentialCourseId: 1, courseName: "Relaxation Techniques and Meditation" },
          { microcredentialCourseId: 2, courseName: "STRESS MANAGEMENT" }
        ]);
      }
    } catch (err) {
      console.error("Failed to load courses by stream:", err);
    } finally {
      setAddLoading(false);
    }
  };

  // On Course change in Add Modal
  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedVideoId("");
    setAvailableVideos([]);

    if (!courseId) return;

    try {
      setAddLoading(true);
      const res = await getMicrocredentialVideoDetailsByCourseId(courseId);
      if (res?.success && Array.isArray(res.videos)) {
        setAvailableVideos(res.videos);
      } else {
        setAvailableVideos([
          { microcreditYoutubeDataMasterId: 101, videoTitle: "Lecture 1: The Physiology of Stress & Response Signals" },
          { microcreditYoutubeDataMasterId: 102, videoTitle: "Lecture 2: Guided Meditation & Vagus Nerve Stimulation" }
        ]);
      }
    } catch (err) {
      console.error("Failed to load video details:", err);
    } finally {
      setAddLoading(false);
    }
  };

  // Generate AI Checkpoint Quiz
  const handleGenerateCheckpointQuiz = async (overrideVideoId = null) => {
    const videoId = overrideVideoId || selectedVideoId;
    if (!videoId) {
      setAddModalError("Please select a valid video lecture.");
      return;
    }

    setGeneratingQuiz(true);
    setAddModalError("");

    try {
      const res = await generateMicrocredentialCheckpointQuiz(Number(videoId));
      if (res?.success) {
        setSuccessMessage(res.message || "AI Checkpoint Quiz generated successfully!");
        setIsAddModalOpen(false);
        if (isTopicModalOpen && selectedCourseForTopics) {
          handleOpenTopicModal(selectedCourseForTopics);
        }
        loadCourseTopics();
      } else {
        setAddModalError(res?.message || "Failed to generate checkpoint quiz.");
      }
    } catch (err) {
      console.error("Error generating checkpoint quiz:", err);
      setAddModalError(err.message || "An unexpected error occurred.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Execute Deletion
  const handleExecuteDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));

    try {
      if (deleteConfirm.type === "course") {
        const res = await deleteMicrocredentialCheckpointQuizByCourseId(deleteConfirm.id);
        if (res?.success) {
          setSuccessMessage(res.message || "Course checkpoint quizzes deleted successfully!");
          loadCourseTopics();
        } else {
          setErrorMessage(res?.message || "Failed to delete checkpoint quizzes.");
        }
      } else if (deleteConfirm.type === "video") {
        const res = await deleteMicrocredentialCheckpointQuizByYoutubeDataMasterId(deleteConfirm.id);
        if (res?.success) {
          setSuccessMessage(res.message || "Video checkpoint quiz deleted successfully!");
          if (selectedCourseForTopics) {
            handleOpenTopicModal(selectedCourseForTopics);
          }
        } else {
          setTopicError(res?.message || "Failed to delete video quiz.");
        }
      }
    } catch (err) {
      console.error("Deletion error:", err);
      setErrorMessage(err.message || "Failed to delete.");
    } finally {
      setDeleteConfirm({ isOpen: false, type: "", id: null, title: "", loading: false });
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startEntry = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalRecords);

  // Helper format time
  const formatSeconds = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full pb-16">
      <PageMeta
        title="Microcredential Checkpoint Quiz List | IgnitoVerse Admin"
        description="Manage video topic checkpoint quizzes and AI assessment markers for microcredential courses."
      />
      <PageBreadcrumb pageTitle="Microcredential Checkpoint Quiz List" />

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Top Header & Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Microcredential Checkpoint Quiz List
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Configure course lecture video checkpoints, review question banks, and monitor evaluation statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-600 focus:outline-hidden dark:bg-brand-600 dark:hover:bg-brand-500"
          >
            <PlusIcon className="size-4 stroke-2" />
            <span>Add Checkpoint Quiz</span>
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircleIcon className="size-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            <AlertIcon className="size-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-5 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Show</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-gray-700 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            </div>
            <span>entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Stream Name
                </th>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Microcredential Course
                </th>
                <th className="px-5 py-3.5 text-center font-bold text-gray-700 dark:text-gray-300">
                  Topic
                </th>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Updated Date
                </th>
                <th className="px-5 py-3.5 text-center font-bold text-gray-700 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
                    <div>Loading checkpoint quiz records...</div>
                  </td>
                </tr>
              ) : coursesList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No checkpoint quiz courses found.
                  </td>
                </tr>
              ) : (
                coursesList.map((course, idx) => (
                  <tr
                    key={course.microcredentialCourseId || idx}
                    className="hover:bg-gray-50/70 transition dark:hover:bg-gray-800/40"
                  >
                    {/* Stream Name */}
                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {course.streamName || "General"}
                    </td>

                    {/* Microcredential Course */}
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                      {course.microcredentialCourseName}
                    </td>

                    {/* Topic Action Button (Eye Icon) */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenTopicModal(course)}
                        title="View Course Topics & Video Checkpoints"
                        className="inline-flex size-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-xs transition hover:bg-brand-600 focus:outline-hidden dark:bg-brand-600 dark:hover:bg-brand-500"
                      >
                        <EyeIcon className="size-4" />
                      </button>
                    </td>

                    {/* Updated Date */}
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {course.updatedOn || "Recent"}
                    </td>

                    {/* Action (Delete Icon) */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            type: "course",
                            id: course.microcredentialCourseId,
                            title: course.microcredentialCourseName,
                            loading: false
                          })
                        }
                        title="Delete All Checkpoint Quizzes For This Course"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      >
                        <TrashBinIcon className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-gray-800 text-xs">
          <div className="text-gray-500 dark:text-gray-400">
            Showing {startEntry} to {endEntry} of {totalRecords} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <ChevronLeftIcon className="size-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), currentPage + 2)
              .map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`inline-flex size-7 items-center justify-center rounded-lg text-xs font-semibold transition ${
                    currentPage === pageNum
                      ? "bg-brand-500 text-white shadow-xs dark:bg-brand-600"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <ChevronRightIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOPIC DETAILS MODAL (Videos & Checkpoint Status)                          */}
      {/* ========================================================================= */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 mb-1">
                  <span>Course Video Topics</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedCourseForTopics?.microcredentialCourseName}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {topicError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {topicError}
                </div>
              )}

              {topicLoading ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
                  <p className="text-xs">Loading course lecture videos...</p>
                </div>
              ) : topicDetails.length === 0 ? (
                <div className="py-10 text-center text-gray-500 dark:text-gray-400 text-xs">
                  No video lectures or topics found for this course.
                </div>
              ) : (
                <div className="space-y-3">
                  {topicDetails.map((tp, idx) => (
                    <div
                      key={tp.microcreditYoutubeDataMasterId || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40"
                    >
                      <div className="flex items-start gap-3">
                        <div className="size-9 flex shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 mt-0.5">
                          <VideoIcon className="size-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-xs">
                            {tp.videoTitle || tp.topicName || `Lecture #${idx + 1}`}
                          </div>
                          {tp.topicName && tp.videoTitle && (
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              Topic: {tp.topicName}
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-2">
                            {tp.isCheckpointAvailable ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Checkpoint Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                <span className="size-1.5 rounded-full bg-amber-500" />
                                No Quiz Generated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons per video */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {tp.isCheckpointAvailable ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenPreviewModal(tp)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition dark:border-brand-900/50 dark:bg-gray-800 dark:text-brand-400"
                            >
                              <EyeIcon className="size-3.5" />
                              <span>View Quiz</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  type: "video",
                                  id: tp.microcreditYoutubeDataMasterId,
                                  title: tp.videoTitle || tp.topicName,
                                  loading: false
                                })
                              }
                              title="Delete Video Checkpoint Quiz"
                              className="inline-flex size-7 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition dark:border-gray-700 dark:hover:bg-red-950/30"
                            >
                              <TrashBinIcon className="size-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateCheckpointQuiz(tp.microcreditYoutubeDataMasterId)}
                            disabled={generatingQuiz}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 transition disabled:opacity-50 dark:bg-brand-600"
                          >
                            <span>Generate Quiz</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-4 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKPOINT QUIZ QUESTION PREVIEW MODAL                                    */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 mb-1">
                  <span>Interactive Checkpoint Questions</span>
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedVideoForPreview?.videoTitle || "Video Checkpoint Assessment"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {previewLoading ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
                  <p className="text-xs">Loading checkpoint questions...</p>
                </div>
              ) : previewError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {previewError}
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-xs">
                  No question details available for this video checkpoint.
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((q, qIndex) => (
                    <div
                      key={q.microcredentialYoutubeCheckPointsId || qIndex}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-800/30"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5 dark:border-gray-800">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Question #{qIndex + 1}
                        </span>
                        {q.checkpointQuizTime > 0 && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                            ⏱ Timestamp: {formatSeconds(q.checkpointQuizTime)}
                          </span>
                        )}
                      </div>

                      <p className="mt-2.5 text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                        {q.question}
                      </p>

                      {/* Correct Answer */}
                      {q.answer && (
                        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                          <span className="font-bold">Correct Answer: </span>
                          <span>{q.answer}</span>
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-4 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CHECKPOINT QUIZ MODAL (Stream -> Course -> Video)                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Add Checkpoint Quiz
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Select course lecture video to generate an interactive AI checkpoint assessment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {addModalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {addModalError}
                </div>
              )}

              {/* Step 1: Select Stream */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Stream <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedStreamId}
                    onChange={(e) => handleStreamChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-9 text-xs text-gray-800 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">-- Choose Academic Stream --</option>
                    {streamList.map((st) => (
                      <option key={st.streamId} value={st.streamId}>
                        {st.streamName}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Step 2: Select Course */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Microcredential Course <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCourseId}
                    disabled={!selectedStreamId || addLoading}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-9 text-xs text-gray-800 shadow-xs focus:border-brand-500 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">-- Choose Course --</option>
                    {availableCourses.map((c) => (
                      <option key={c.microcredentialCourseId} value={c.microcredentialCourseId}>
                        {c.courseName || c.microcredentialCourseName}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Step 3: Select Video */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Select Video Lecture <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedVideoId}
                    disabled={!selectedCourseId || addLoading}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-9 text-xs text-gray-800 shadow-xs focus:border-brand-500 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="">-- Choose Video Lecture --</option>
                    {availableVideos.map((v) => (
                      <option key={v.microcreditYoutubeDataMasterId} value={v.microcreditYoutubeDataMasterId}>
                        {v.videoTitle || `Lecture #${v.microcreditYoutubeDataMasterId}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-5 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedVideoId || generatingQuiz}
                onClick={() => handleGenerateCheckpointQuiz()}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition dark:bg-brand-600"
              >
                {generatingQuiz ? (
                  <>
                    <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Generating AI Quiz...</span>
                  </>
                ) : (
                  <span>Generate Checkpoint Quiz</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG                                                */}
      {/* ========================================================================= */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="size-11 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 flex items-center justify-center mb-4">
              <TrashBinIcon className="size-5" />
            </div>

            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Confirm Deletion
            </h4>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Are you sure you want to delete checkpoint quizzes for{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                "{deleteConfirm.title}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm({ isOpen: false, type: "", id: null, title: "", loading: false })
                }
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteConfirm.loading}
                onClick={handleExecuteDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleteConfirm.loading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
