import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  ChevronDownIcon,
  ChevronUpIcon,
  AngleLeftIcon,
  AngleRightIcon,
} from "../../icons";
import {
  adminGetMicroCourseManyDiscussionForumQuestionsList,
  adminGetMicroCourseManyDiscussionQuestionReplyList,
  deleteMicroManyDiscussionForumQuestions,
  deleteMicroManyDiscussionForumeReply,
  logJsError,
} from "../../services/adminMicrocredentialService";

export default function CommonDiscussion() {
  // Data state
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Search & Pagination & Sorting state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [orderByColumn, setOrderByColumn] = useState("CreatedOn");
  const [orderByDirection, setOrderByDirection] = useState("DESC");
  const [markAllAsRead, setMarkAllAsRead] = useState(false);

  // Reply Modal state
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Delete Question Modal state
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);

  // Delete Reply Modal state
  const [deleteReplyTarget, setDeleteReplyTarget] = useState(null);
  const [deletingReply, setDeletingReply] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Questions List
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await adminGetMicroCourseManyDiscussionForumQuestionsList(
        currentPage,
        pageSize,
        orderByColumn,
        orderByDirection,
        0,
        0,
        debouncedSearch
      );

      if (response && response.success !== false) {
        const list = response.discussionQuestionList || [];
        setQuestions(list);
        setTotalRecords(response.pageDetail?.totalRecords || list.length);
      } else {
        const msg = response?.message || "Failed to load discussion questions.";
        setErrorMessage(msg);
        logJsError(msg, "", "CommonDiscussion.jsx fetchQuestions");
      }
    } catch (err) {
      console.error("Error fetching common discussion list:", err);
      const msg = err.message || "An unexpected error occurred.";
      setErrorMessage(msg);
      logJsError(msg, err.stack, "CommonDiscussion.jsx fetchQuestions");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, orderByColumn, orderByDirection, debouncedSearch]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle Sort Change
  const handleSort = (column) => {
    if (orderByColumn === column) {
      setOrderByDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setOrderByColumn(column);
      setOrderByDirection("ASC");
    }
    setCurrentPage(1);
  };

  // Open Reply Modal and Fetch Replies
  const handleOpenReplies = async (questionItem) => {
    setSelectedQuestion(questionItem);
    setReplies([]);
    setReplyError("");
    setLoadingReplies(true);

    try {
      const response = await adminGetMicroCourseManyDiscussionQuestionReplyList(
        questionItem.microCourseDiscussionQuestionId
      );

      if (response && response.success !== false) {
        const replyList = response.getMicroCourseManyDiscussionQuestionReply || [];
        setReplies(replyList);
      } else {
        const msg = response?.message || "Failed to load replies.";
        setReplyError(msg);
        logJsError(msg, "", "CommonDiscussion.jsx handleOpenReplies");
      }
    } catch (err) {
      console.error("Error fetching replies:", err);
      const msg = err.message || "An unexpected error occurred while loading replies.";
      setReplyError(msg);
      logJsError(msg, err.stack, "CommonDiscussion.jsx handleOpenReplies");
    } finally {
      setLoadingReplies(false);
    }
  };

  // Refresh Replies for the currently selected question
  const refreshReplies = async (questionId) => {
    setLoadingReplies(true);
    try {
      const response = await adminGetMicroCourseManyDiscussionQuestionReplyList(questionId);
      if (response && response.success !== false) {
        setReplies(response.getMicroCourseManyDiscussionQuestionReply || []);
      }
    } catch (err) {
      console.error("Error refreshing replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Delete Question Confirmation Handler
  const handleDeleteQuestion = async () => {
    if (!deleteQuestionTarget) return;
    setDeletingQuestion(true);
    setErrorMessage("");

    try {
      const response = await deleteMicroManyDiscussionForumQuestions(
        deleteQuestionTarget.microCourseDiscussionQuestionId,
        0
      );

      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Discussion question deleted successfully.");
        setDeleteQuestionTarget(null);
        // If the deleted question was open in modal, close it
        if (selectedQuestion?.microCourseDiscussionQuestionId === deleteQuestionTarget.microCourseDiscussionQuestionId) {
          setSelectedQuestion(null);
        }
        fetchQuestions();
      } else {
        const msg = response?.message || "Failed to delete discussion question.";
        setErrorMessage(msg);
        logJsError(msg, "", "CommonDiscussion.jsx handleDeleteQuestion");
      }
    } catch (err) {
      console.error("Error deleting question:", err);
      const msg = err.message || "An unexpected error occurred.";
      setErrorMessage(msg);
      logJsError(msg, err.stack, "CommonDiscussion.jsx handleDeleteQuestion");
    } finally {
      setDeletingQuestion(false);
    }
  };

  // Delete Reply Confirmation Handler
  const handleDeleteReply = async () => {
    if (!deleteReplyTarget) return;
    setDeletingReply(true);

    try {
      const response = await deleteMicroManyDiscussionForumeReply(
        deleteReplyTarget.microCourseDiscussionReplyId,
        0
      );

      if (response && response.success !== false) {
        setSuccessMessage(response.message || "Reply deleted successfully.");
        const questionId = selectedQuestion?.microCourseDiscussionQuestionId;
        setDeleteReplyTarget(null);
        if (questionId) {
          refreshReplies(questionId);
        }
      } else {
        const msg = response?.message || "Failed to delete reply.";
        setReplyError(msg);
        logJsError(msg, "", "CommonDiscussion.jsx handleDeleteReply");
      }
    } catch (err) {
      console.error("Error deleting reply:", err);
      const msg = err.message || "An unexpected error occurred while deleting reply.";
      setReplyError(msg);
      logJsError(msg, err.stack, "CommonDiscussion.jsx handleDeleteReply");
    } finally {
      setDeletingReply(false);
    }
  };

  // Pagination calculation
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
        title="Common Discussion | Admin Dashboard"
        description="View and manage student and professor microcredential discussion forums."
      />
      <PageBreadcrumb pageTitle="Common Discussion" />

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
        {/* Top Search & Read Filter Bar matching screenshot */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-500 dark:text-gray-400">
              <input
                type="checkbox"
                checked={markAllAsRead}
                onChange={(e) => setMarkAllAsRead(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
              />
              <span>Mark all as read</span>
            </label>
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

        {/* Discussion Questions Table */}
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="border-b border-gray-200 dark:border-gray-800">
              <TableRow className="hover:bg-transparent">
                <TableCell
                  isHeader
                  className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none"
                  onClick={() => handleSort("MicrocredentialCourseName")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Microcredential Name</span>
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
                  onClick={() => handleSort("Question")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Question</span>
                    <span className="text-gray-400">
                      {orderByColumn === "Question" ? (
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
                  onClick={() => handleSort("QuestionAskedByStudent")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Question Asked By</span>
                    <span className="text-gray-400">
                      {orderByColumn === "QuestionAskedByStudent" ? (
                        orderByDirection === "ASC" ? <ChevronUpIcon className="size-3.5 inline" /> : <ChevronDownIcon className="size-3.5 inline" />
                      ) : (
                        "▾"
                      )}
                    </span>
                  </div>
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm"
                >
                  View
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 px-4 text-left font-semibold text-gray-900 dark:text-gray-100 text-sm cursor-pointer select-none"
                  onClick={() => handleSort("CreatedOn")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created On</span>
                    <span className="text-gray-400">
                      {orderByColumn === "CreatedOn" ? (
                        orderByDirection === "ASC" ? <ChevronUpIcon className="size-3.5 inline" /> : <ChevronDownIcon className="size-3.5 inline" />
                      ) : (
                        "▾"
                      )}
                    </span>
                  </div>
                </TableCell>

                <TableCell
                  isHeader
                  className="py-3 px-4 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading discussion questions...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No discussion questions found.
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((item) => {
                  const studentName = item.questionAskedByStudent;
                  const professorName = item.questionAskedByProfessor;

                  return (
                    <TableRow
                      key={item.microCourseDiscussionQuestionId}
                      className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Microcredential Course Name */}
                      <TableCell className="py-4 px-4 text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-xs uppercase">
                        {item.microcredentialCourseName || "-"}
                      </TableCell>

                      {/* Question */}
                      <TableCell className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                        {item.question}
                      </TableCell>

                      {/* Question Asked By with Pill Badges */}
                      <TableCell className="py-4 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          {studentName ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#2563eb] text-white">
                                Student
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {studentName}
                              </span>
                            </>
                          ) : professorName ? (
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#7c3aed] text-white">
                                Professor
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {professorName}
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                              User
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* View Eye Icon Button */}
                      <TableCell className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenReplies(item)}
                          title="View Replies"
                          className="w-7 h-7 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white inline-flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
                        >
                          <EyeIcon className="size-3.5 fill-white text-white" />
                        </button>
                      </TableCell>

                      {/* Created On */}
                      <TableCell className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {item.createdOn || "-"}
                      </TableCell>

                      {/* Action Delete Button */}
                      <TableCell className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeleteQuestionTarget(item)}
                          title="Delete Discussion Thread"
                          className="w-7 h-7 rounded-md text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 inline-flex items-center justify-center transition-colors"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer with Showing info and Red active page button */}
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
                className={`min-w-8 h-8 px-2.5 rounded-md text-sm font-medium transition-all ${
                  currentPage === pageNum
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

      {/* QUESTION REPLIES MODAL */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-gray-100 dark:border-gray-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Discussion Replies
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedQuestion.microcredentialCourseName}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Question Details Banner */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                {selectedQuestion.questionAskedByStudent ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#2563eb] text-white">
                    Student
                  </span>
                ) : selectedQuestion.questionAskedByProfessor ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#7c3aed] text-white">
                    Professor
                  </span>
                ) : null}
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {selectedQuestion.questionAskedByStudent || selectedQuestion.questionAskedByProfessor || "User"}
                </span>
                <span className="text-xs text-gray-400">• {selectedQuestion.createdOn}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedQuestion.question}
              </p>
            </div>

            {/* Modal Body - Replies List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {replyError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs">
                  {replyError}
                </div>
              )}

              {loadingReplies ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Loading replies...</span>
                </div>
              ) : replies.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm font-medium">No replies found.</p>
                  <p className="text-xs text-gray-400 mt-1">There are no replies posted to this question yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    All Replies ({replies.length})
                  </h4>
                  {replies.map((replyItem) => {
                    const studentReply = replyItem.repliedByStudent;
                    const profReply = replyItem.repliedByProfessor;

                    return (
                      <div
                        key={replyItem.microCourseDiscussionReplyId}
                        className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/30 hover:border-gray-200 dark:hover:border-gray-700 transition-all flex items-start justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            {studentReply ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#2563eb] text-white">
                                Student
                              </span>
                            ) : profReply ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#7c3aed] text-white">
                                Professor
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500 text-white">
                                User
                              </span>
                            )}
                            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                              {studentReply || profReply || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-400">• {replyItem.createdOn}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                            {replyItem.reply}
                          </p>
                        </div>

                        {/* Delete Reply Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteReplyTarget(replyItem)}
                          title="Delete Reply"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shrink-0"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE QUESTION MODAL */}
      {deleteQuestionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-full">
                <TrashBinIcon className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Delete Discussion Question
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to delete this discussion question thread?
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 font-medium mb-4 italic">
              "{deleteQuestionTarget.question}"
            </div>
            <p className="text-xs text-red-500 mb-6">
              This action cannot be undone and will delete all replies associated with this question.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteQuestionTarget(null)}
                disabled={deletingQuestion}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteQuestion}
                disabled={deletingQuestion}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {deletingQuestion ? (
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

      {/* CONFIRM DELETE REPLY MODAL */}
      {deleteReplyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-full">
                <TrashBinIcon className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Delete Discussion Reply
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to delete this reply?
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 font-medium mb-6 italic">
              "{deleteReplyTarget.reply}"
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteReplyTarget(null)}
                disabled={deletingReply}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReply}
                disabled={deletingReply}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {deletingReply ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Reply</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
