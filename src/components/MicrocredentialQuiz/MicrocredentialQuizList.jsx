import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  TrashBinIcon,
  CloseIcon,
  CheckCircleIcon,
  AlertIcon,
  EyeIcon,
  PencilIcon,
  InfoIcon,
  CheckLineIcon
} from "../../icons";

import {
  fetchPaginatedMicrocredentialQuizList,
  toggleQuizActiveInactiveStatus,
  deleteQuizByQuizId,
  getMicrocredentialQuizCategoryList
} from "../../services/AdminQuizPageService";

import QuizPreviewView from "./QuizPreviewView";

export default function MicrocredentialQuizList() {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // STATE: Main Quiz List
  // ==========================================
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );

  // Filters State
  const [filterTitle, setFilterTitle] = useState("");
  const [filterCreater, setFilterCreater] = useState("");
  const [filterStream, setFilterStream] = useState("");
  const [filterMicrocredential, setFilterMicrocredential] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "UpdatedOn",
    direction: "DESC"
  });

  // Modals & Preview States
  const [previewingQuiz, setPreviewingQuiz] = useState(null);

  // Small Popups
  const [viewingDescriptionQuiz, setViewingDescriptionQuiz] = useState(null);
  const [viewingEducationDetailsQuiz, setViewingEducationDetailsQuiz] = useState(null);
  const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Categories Modal
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);


  // ==========================================
  // API: Fetch Main Quizzes
  // ==========================================
  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        pageNo: currentPage,
        pageSize: pageSize,
        orderByColumn: sortConfig.key,
        orderByDirection: sortConfig.direction,
        totalRecords: 0,
        searchInput: searchQuery.trim(),
        educationTypeId: 2, // Microcredential
        quizTitle: filterTitle.trim(),
        stream: filterStream.trim(),
        microcredentialName: filterMicrocredential.trim(),
        quizCreaterName: filterCreater.trim(),
        dueDate: filterDueDate
      };

      const res = await fetchPaginatedMicrocredentialQuizList(payload);

      if (res && res.success !== false) {
        const list = res.quizDegreeList || [];
        setQuizzes(list);
        setTotalRecords(res.pageDetail?.totalRecords || res.totalRecords || list.length);
      } else {
        setErrorMessage(res?.message || res?.errorDescription || "Failed to load quizzes.");
        setQuizzes([]);
      }
    } catch (err) {
      console.error("Error loading quizzes:", err);
      setErrorMessage(err.message || "Failed to connect with Quiz API.");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortConfig, searchQuery, filterTitle, filterCreater, filterStream, filterMicrocredential, filterDueDate]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);


  // ==========================================
  // HANDLERS: Filters & Search
  // ==========================================
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadQuizzes();
  };

  const handleFilterReset = () => {
    setFilterTitle("");
    setFilterCreater("");
    setFilterStream("");
    setFilterMicrocredential("");
    setFilterDueDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSort = (columnKey) => {
    setSortConfig((prev) => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === "ASC" ? "DESC" : "ASC"
    }));
  };

  // ==========================================
  // HANDLERS: Toggle Status
  // ==========================================
  const handleToggleStatus = async (quiz) => {
    const quizId = quiz.quizId || quiz.QuizId;
    const currentActive = Boolean(quiz.isActive ?? quiz.IsActive);
    const newStatus = !currentActive;

    // Optimistic UI update
    setQuizzes((prev) =>
      prev.map((q) =>
        (q.quizId || q.QuizId) === quizId ? { ...q, isActive: newStatus, IsActive: newStatus } : q
      )
    );

    try {
      const res = await toggleQuizActiveInactiveStatus(quizId, newStatus);
      if (res && res.success !== false) {
        setSuccessMessage(res.message || `Quiz status changed to ${newStatus ? "Active" : "Inactive"}.`);
      } else {
        // Revert
        setQuizzes((prev) =>
          prev.map((q) =>
            (q.quizId || q.QuizId) === quizId ? { ...q, isActive: currentActive, IsActive: currentActive } : q
          )
        );
        setErrorMessage(res?.message || "Failed to update quiz status.");
      }
    } catch (err) {
      // Revert
      setQuizzes((prev) =>
        prev.map((q) =>
          (q.quizId || q.QuizId) === quizId ? { ...q, isActive: currentActive, IsActive: currentActive } : q
        )
      );
      setErrorMessage(err.message || "Failed to update quiz status.");
    }
  };

  // ==========================================
  // HANDLERS: Delete Quiz
  // ==========================================
  const handleDeleteQuiz = async () => {
    if (!deleteConfirmQuiz) return;
    const quizId = deleteConfirmQuiz.quizId || deleteConfirmQuiz.QuizId;
    setDeleting(true);

    try {
      const res = await deleteQuizByQuizId(quizId);
      if (res && res.success !== false) {
        setSuccessMessage(res.message || "Quiz deleted successfully.");
        setQuizzes((prev) => prev.filter((q) => (q.quizId || q.QuizId) !== quizId));
        setTotalRecords((prev) => Math.max(0, prev - 1));
      } else {
        setErrorMessage(res?.message || "Failed to delete quiz.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete quiz.");
    } finally {
      setDeleting(false);
      setDeleteConfirmQuiz(null);
    }
  };

  // ==========================================
  // HANDLERS: Edit Categories
  // ==========================================
  const handleOpenCategories = async () => {
    setIsCategoriesModalOpen(true);
    setLoadingCategories(true);
    try {
      const res = await getMicrocredentialQuizCategoryList();
      if (res?.success && Array.isArray(res.microcredentialQuizCategoryList)) {
        setCategoriesList(res.microcredentialQuizCategoryList);
      } else {
        setCategoriesList([
          { microcredentialQuizCategoryId: 1, microcredentialCategoryName: "General Assessment" },
          { microcredentialQuizCategoryId: 2, microcredentialCategoryName: "Module Checkpoint" },
          { microcredentialQuizCategoryId: 3, microcredentialCategoryName: "Final Certification Quiz" }
        ]);
      }
    } catch (err) {
      console.warn("Failed to load categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Printable Quiz Handler
  const handlePrintQuiz = (quiz) => {
    setPreviewingQuiz(quiz);
    setTimeout(() => {
      window.print();
    }, 500);
  };


  // If in Preview Mode, render full Quiz Preview (Screenshots 2 & 3)
  if (previewingQuiz) {
    return (
      <QuizPreviewView
        quiz={previewingQuiz}
        onExit={() => setPreviewingQuiz(null)}
      />
    );
  }

  return (
    <div className="w-full pb-16">
      <PageMeta
        title="Microcredential Quiz Management | IgnitoVerse Admin"
        description="Comprehensive administration dashboard for microcredential quizzes, questions, student reviews, and checkpoint reports."
      />
      <PageBreadcrumb pageTitle="Microcredential Quiz Management" />

      {/* Notifications */}
      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
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

      {errorMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertIcon className="size-4 text-red-600 dark:text-red-400" />
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

      {/* ========================================================================= */}
      {/* 1. TOP CARD: ACTION BUTTONS & FILTER FORM (SCREENSHOT 1)                  */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03] mb-6">
        {/* Top Action Buttons (Right-aligned in theme colors - NO RED) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Microcredential Quiz Filters
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Filter quizzes by stream, course, author, or due date criteria
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/microcredential/quiz-add")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition"
            >
              <span>+</span>
              <span>Add New Quiz</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCategories}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
            >
              <span>Edit Categories</span>
            </button>
          </div>
        </div>

        {/* Filter Input Grid */}
        <form onSubmit={handleFilterSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Quiz Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                placeholder="Quiz Title"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Quiz Creater Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Quiz Creater Name
              </label>
              <input
                type="text"
                value={filterCreater}
                onChange={(e) => setFilterCreater(e.target.value)}
                placeholder="Creater Name"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Stream */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Stream
              </label>
              <input
                type="text"
                value={filterStream}
                onChange={(e) => setFilterStream(e.target.value)}
                placeholder="Stream"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Microcredential Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Microcredential Name
              </label>
              <input
                type="text"
                value={filterMicrocredential}
                onChange={(e) => setFilterMicrocredential(e.target.value)}
                placeholder="Microcredential name"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={filterDueDate}
                onChange={(e) => setFilterDueDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition"
            >
              <span>Submit</span>
            </button>

            <button
              type="button"
              onClick={handleFilterReset}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
            >
              <span>↺</span>
              <span>Reset</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN QUIZZES DATA TABLE                                                */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-white/[0.03] mb-10">
        {/* Entries & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50/75 dark:bg-gray-800/40">
              <tr>
                <th
                  onClick={() => handleSort("QuizTitle")}
                  className="cursor-pointer px-5 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Quiz Title</span>
                    <span className="text-gray-400 text-[10px]">⇅</span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort("GradeOutOf")}
                  className="cursor-pointer px-5 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500"
                >
                  <div className="flex items-center gap-1.5">
                    <span>GradeOutOf</span>
                    <span className="text-gray-400 text-[10px]">⇅</span>
                  </div>
                </th>

                <th
                  onClick={() => handleSort("DueDate")}
                  className="cursor-pointer px-5 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-brand-500"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Due Date</span>
                    <span className="text-gray-400 text-[10px]">⇅</span>
                  </div>
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  Quiz Education Details
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  Quiz Description
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  Active / Inactive
                </th>

                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
                    <div>Loading quizzes...</div>
                  </td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    No microcredential quizzes found. Click <strong>+ Add New Quiz</strong> to create one.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => {
                  const qId = quiz.quizId || quiz.QuizId || 0;
                  const isActive = Boolean(quiz.isActive ?? quiz.IsActive);

                  return (
                    <tr
                      key={qId}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                    >
                      {/* Quiz Title */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1">
                          {quiz.quizTitle || quiz.QuizTitle || "Untitled Quiz"}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {quiz.microcredentialName || quiz.streamName || "Microcredential Course"}
                        </div>
                      </td>

                      {/* GradeOutOf */}
                      <td className="px-5 py-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {quiz.gradeOutOf ?? quiz.GradeOutOf ?? 10}
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-300">
                        {quiz.dueDate || quiz.DueDate || "—"}
                      </td>

                      {/* Quiz Education Details */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingEducationDetailsQuiz(quiz)}
                          title="View Education Details"
                          className="inline-flex size-7 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300 transition"
                        >
                          <EyeIcon className="size-3.5" />
                        </button>
                      </td>

                      {/* Quiz Description */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingDescriptionQuiz(quiz)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400"
                        >
                          View
                        </button>
                      </td>

                      {/* Active / Inactive */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(quiz)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                          <span>{isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions: Print, View Preview, Edit, Delete */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print */}
                          <button
                            type="button"
                            onClick={() => handlePrintQuiz(quiz)}
                            title="Print Quiz"
                            className="inline-flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition"
                          >
                            <span className="text-xs">🖨️</span>
                          </button>

                          {/* View Preview (Screenshots 2 & 3) */}
                          <button
                            type="button"
                            onClick={() => setPreviewingQuiz(quiz)}
                            title="View Quiz Preview & Answer Key"
                            className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 transition"
                          >
                            <EyeIcon className="size-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/microcredential/quiz-edit/${qId}`, {
                                state: { quiz },
                              })
                            }
                            title="Edit Quiz"
                            className="inline-flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 transition"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmQuiz(quiz)}
                            title="Delete Quiz"
                            className="inline-flex size-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
                          >
                            <TrashBinIcon className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {quizzes.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-xs disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800"
            >
              Previous
            </button>

            <span className="rounded-lg bg-brand-500 px-3 py-1.5 font-semibold text-white">
              {currentPage}
            </span>

            <button
              type="button"
              disabled={currentPage * pageSize >= totalRecords}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 font-medium shadow-xs disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 3. Quiz Description Modal */}
      {viewingDescriptionQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Quiz Description: {viewingDescriptionQuiz.quizTitle || viewingDescriptionQuiz.QuizTitle}
              </h3>
              <button
                type="button"
                onClick={() => setViewingDescriptionQuiz(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
              {viewingDescriptionQuiz.quizDescription?.trim() ||
                viewingDescriptionQuiz.QuizDescription?.trim() ||
                viewingDescriptionQuiz.description?.trim() ||
                viewingDescriptionQuiz.Description?.trim() ||
                "No custom description provided for this quiz."}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingDescriptionQuiz(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quiz Education Details Modal */}
      {viewingEducationDetailsQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Quiz Education Details
              </h3>
              <button
                type="button"
                onClick={() => setViewingEducationDetailsQuiz(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Stream:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingEducationDetailsQuiz.streamName || "Management"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Education Type:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingEducationDetailsQuiz.educationTypeName || "Microcredential"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Microcredential Course:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-right max-w-[200px] truncate">
                  {viewingEducationDetailsQuiz.microcredentialCourseName || viewingEducationDetailsQuiz.microcredentialName || "Not assigned"}
                </span>
              </div>

              {viewingEducationDetailsQuiz.degreeProgramName && (
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                  <span className="text-gray-500 dark:text-gray-400">Degree Program:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {viewingEducationDetailsQuiz.degreeProgramName}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Created By:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingEducationDetailsQuiz.quizCreatedName || viewingEducationDetailsQuiz.quizCreaterName || "Admin"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Created On:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingEducationDetailsQuiz.createdOn || "—"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Updated On:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingEducationDetailsQuiz.updatedOn || "—"}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {viewingEducationDetailsQuiz.dueDate || "—"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingEducationDetailsQuiz(null)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Categories Modal */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Microcredential Quiz Categories
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoriesModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4">
              {loadingCategories ? (
                <div className="py-6 text-center text-xs text-gray-500">Loading categories...</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/60 max-h-60 overflow-y-auto">
                  {categoriesList.map((c) => (
                    <div
                      key={c.microcredentialQuizCategoryId}
                      className="flex items-center justify-between py-2.5 px-2 text-xs"
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {c.microcredentialCategoryName}
                      </span>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        ID: #{c.microcredentialQuizCategoryId}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCategoriesModalOpen(false)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteConfirmQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-800 text-center">
            <div className="mx-auto size-12 flex items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-4">
              <TrashBinIcon className="size-6" />
            </div>

            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Delete Quiz?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                "{deleteConfirmQuiz.quizTitle || deleteConfirmQuiz.QuizTitle}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmQuiz(null)}
                disabled={deleting}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteQuiz}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

