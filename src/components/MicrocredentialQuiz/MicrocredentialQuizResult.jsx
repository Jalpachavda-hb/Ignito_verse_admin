import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  DocsIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  AngleRightIcon as ChevronRightIcon,
  CheckCircleIcon,
  AlertIcon
} from "../../icons";
import {
  getMicrocredentialQuizStudentAttemptList,
  getStudentMicrocredentialQuizResultGetByQuizId,
  getStudentMicrocredentialQuizResultByAttempt
} from "../../services/AdminQuizPageService";

export default function MicrocredentialQuizResult() {
  // Table & search state
  const [resultsList, setResultsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Student Quiz Audit Result Modal state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedStudentItem, setSelectedStudentItem] = useState(null);
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [detailedResult, setDetailedResult] = useState(null);

  // Base records list
  const baseStudentResults = [
    {
      studentId: 37,
      quizId: 3,
      studentName: "Leesa Mehra",
      email: "uu22@gmail.com",
      quizTitle: "Relaxation Techniques Quiz-1",
      quizDescription: "",
      microcredentialCourseName: "STRESS MANAGEMENT",
      streamName: "Management"
    }
  ];

  // Load Quiz Results (Local search and pagination)
  const loadQuizResults = useCallback(() => {
    setLoading(true);
    setErrorMessage("");

    try {
      let filtered = [...baseStudentResults];

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.studentName.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            r.quizTitle.toLowerCase().includes(q) ||
            (r.microcredentialCourseName && r.microcredentialCourseName.toLowerCase().includes(q)) ||
            (r.streamName && r.streamName.toLowerCase().includes(q))
        );
      }

      setTotalRecords(filtered.length);
      const startIdx = (currentPage - 1) * pageSize;
      const paginated = filtered.slice(startIdx, startIdx + pageSize);
      setResultsList(paginated);
    } catch (err) {
      console.error("Failed to load quiz results:", err);
      setErrorMessage("Failed to load quiz assessment reports.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  // Load dynamic quiz result from GetStudentMicrocredentialQuizResultGetByQuizId
  const loadDynamicStudentQuizResult = useCallback(async (studentItem, attemptId = 9) => {
    if (!studentItem) return;
    setAuditLoading(true);
    setAuditError("");

    try {
      // 1. Fetch attempts list
      const attemptsRes = await getMicrocredentialQuizStudentAttemptList(
        studentItem.studentId,
        studentItem.quizId
      );

      const attempts = attemptsRes?.quizAttemptList || [];
      setStudentAttempts(attempts);

      const chosenAttemptId = attemptId || attempts[0]?.attemptId || null;
      setSelectedAttemptId(chosenAttemptId);

      if (!chosenAttemptId) {
        setDetailedResult(null);
        setAuditLoading(false);
        return;
      }

      // 2. Dynamic API call: GetStudentMicrocredentialQuizResultGetByQuizId
      const resultRes = await getStudentMicrocredentialQuizResultGetByQuizId(
        studentItem.studentId,
        studentItem.quizId,
        chosenAttemptId
      );

      const targetAttempt = attempts.find((a) => Number(a.attemptId) === Number(chosenAttemptId)) || attempts[0] || {};

      let questions = resultRes?.questions || [];
      let answerOptions = resultRes?.answerOptions || [];

      // Calculate summary statistics matching dynamic response
      const resultData = {
        ...targetAttempt,
        ...(resultRes || {}),
        wrongAnswers: targetAttempt.wrongAnswers ?? resultRes?.wrongAnswers ?? 0,
        skippedQuestions: targetAttempt.skippedQuestions ?? resultRes?.skippedQuestions ?? 0,
        totalQuestions: targetAttempt.totalQuestions ?? resultRes?.totalQuestions ?? questions.length,
        studentPercentage: targetAttempt.percentage ?? resultRes?.percentage ?? 0,
        percentage: targetAttempt.percentage ?? resultRes?.percentage ?? 0,
        studentGrade: targetAttempt.grade || resultRes?.grade || "N/A",
        grade: targetAttempt.grade || resultRes?.grade || "N/A",
        studentTotalPoints: targetAttempt.score ?? resultRes?.studentTotalPoints ?? 0,
        totalPoints: targetAttempt.totalPoints ?? resultRes?.totalPoints ?? 0
      };

      const correctAnswers = questions.filter(q => q.isStudentCorrect).length || targetAttempt.correctQuestionsCount || targetAttempt.score || 0;
      const wrongAnswers = resultData.wrongAnswers || 0;
      const skippedQuestions = resultData.skippedQuestions || 0;
      const totalQuestions = resultData.totalQuestions || questions.length || 0;
      const score = resultData.studentPercentage || resultData.percentage || 0;
      const grade = resultData.studentGrade || resultData.grade || "N/A";

      // Calculate percentages
      const correctPercent = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : "0.0";
      const wrongPercent = totalQuestions > 0 ? (wrongAnswers / totalQuestions * 100).toFixed(1) : "0.0";
      const skippedPercent = totalQuestions > 0 ? (skippedQuestions / totalQuestions * 100).toFixed(1) : "0.0";

      const enriched = {
        ...resultRes,
        questions,
        answerOptions,
        correctAnswers,
        wrongAnswers,
        skippedQuestions,
        totalQuestions,
        score,
        grade,
        correctPercent,
        wrongPercent,
        skippedPercent,
        studentTotalPoints: targetAttempt.score ?? correctAnswers,
        totalPoints: targetAttempt.totalPoints || totalQuestions,
        percentage: Number(correctPercent) || score,
        correctQuestionsCount: correctAnswers
      };

      setDetailedResult(enriched);
    } catch (err) {
      console.error("Failed to load dynamic quiz result from GetStudentMicrocredentialQuizResultGetByQuizId:", err);
      setAuditError("Failed to fetch dynamic quiz result from server.");
    } finally {
      setAuditLoading(false);
    }
  }, []);

  // Initial load: table assessment records only
  useEffect(() => {
    loadQuizResults();
  }, [loadQuizResults]);

  // Open Detailed Quiz Result Audit Modal
  const handleOpenResultAudit = (studentItem) => {
    setSelectedStudentItem(studentItem);
    setIsAuditModalOpen(true);
    loadDynamicStudentQuizResult(studentItem);
  };

  // Switch attempt tab
  const handleSelectAttempt = (attemptId) => {
    if (!selectedStudentItem || attemptId === selectedAttemptId) return;
    setSelectedAttemptId(attemptId);
    loadDynamicStudentQuizResult(selectedStudentItem, attemptId);
  };

  // Strip/render HTML and decode entities safely
  const cleanHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Format option text with 1., 2., 3., 4. numbering matching screenshot style
  const formatOptionText = (text, index) => {
    if (!text) return `${index + 1}. Option ${index + 1}`;
    const cleaned = cleanHtml(text).replace(/^\d+[\.\)]\s*/, "");
    return `${index + 1}. ${cleaned}`;
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startEntry = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="w-full pb-16">
      <PageMeta
        title="Microcredential Quiz Result | IgnitoVerse Admin"
        description="Comprehensive evaluation reports, learner scoring analytics, and dynamic quiz attempt audits."
      />
      <PageBreadcrumb pageTitle="Microcredential Quiz Result" />

      {/* ========================================================================= */}
      {/* MAIN REPORT TABLE                                                        */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            <AlertIcon className="size-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Search & Show entries */}
        <div className="mb-5 space-y-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-700 placeholder-gray-400 shadow-xs focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

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
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Student Name ⬍
                </th>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Email ⬍
                </th>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Quiz Title ⬍
                </th>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Description ⬍
                </th>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Microcredential Name ⬍
                </th>
                <th className="px-5 py-3.5 text-left font-bold text-gray-700 dark:text-gray-300">
                  Stream Name ⬍
                </th>
                <th className="px-5 py-3.5 text-center font-bold text-gray-700 dark:text-gray-300">
                  Action ⬍
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
                    <div>Loading quiz assessment results...</div>
                  </td>
                </tr>
              ) : resultsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No student quiz assessment records found.
                  </td>
                </tr>
              ) : (
                resultsList.map((item, idx) => (
                  <tr
                    key={item.studentId + "-" + item.quizId + "-" + idx}
                    className="hover:bg-gray-50/70 transition dark:hover:bg-gray-800/40"
                  >
                    {/* Student Name */}
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                      {item.studentName}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${item.email}`}
                        className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                      >
                        {item.email}
                      </a>
                    </td>

                    {/* Quiz Title */}
                    <td className="px-5 py-4 text-gray-800 dark:text-gray-200">
                      {item.quizTitle}
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {item.quizDescription || "—"}
                    </td>

                    {/* Microcredential Name */}
                    <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-[11px]">
                      {item.microcredentialCourseName || item.microcredentialName}
                    </td>

                    {/* Stream Name */}
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {item.streamName}
                    </td>

                    {/* Action Button (Blue audit icon) */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenResultAudit(item)}
                        title="View Complete Quiz Result Audit & Attempts"
                        className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs transition hover:bg-blue-700 focus:outline-hidden"
                      >
                        <DocsIcon className="size-4" />
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
                      ? "bg-blue-600 text-white shadow-xs"
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
      {/* STUDENT QUIZ RESULT AUDIT MODAL (Attempts History + Question Breakdown)   */}
      {/* ========================================================================= */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-3 sm:p-5 md:p-6 overflow-y-auto">
          <div className="relative w-full md:w-[94vw] max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 my-4 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm dark:bg-blue-950 dark:text-blue-300">
                  {selectedStudentItem?.studentName?.charAt(0) || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedStudentItem?.studentName}
                    </h3>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                      {selectedStudentItem?.email}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedStudentItem?.microcredentialCourseName || selectedStudentItem?.microcredentialName} • {selectedStudentItem?.quizTitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            {/* Attempt Switcher Tabs (If multiple attempts exist) */}
            {studentAttempts.length > 0 && (
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-5 py-2.5 dark:border-gray-800 dark:bg-gray-800/40 overflow-x-auto">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-2">
                  Attempts:
                </span>
                {studentAttempts.map((att, aIdx) => (
                  <button
                    key={att.attemptId || aIdx}
                    type="button"
                    onClick={() => handleSelectAttempt(att.attemptId)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                      selectedAttemptId === att.attemptId
                        ? "bg-blue-600 text-white shadow-xs"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <span>Attempt #{att.microcredentialQuizAttemptNumber || aIdx + 1}</span>
                    <span className="text-[10px] opacity-80">
                      ({att.score ?? 0}/{att.totalPoints ?? 10} pts • {att.grade || "F"})
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Score Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <div className="rounded-xl border border-gray-100 bg-white p-3.5 text-center shadow-2xs dark:border-gray-800 dark:bg-gray-800">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Score</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  {detailedResult?.studentTotalPoints ?? detailedResult?.score ?? 0} / {detailedResult?.totalPoints ?? 10} <span className="text-xs font-normal text-gray-500">pts</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3.5 text-center shadow-2xs dark:border-gray-800 dark:bg-gray-800">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Accuracy %</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {detailedResult?.correctPercent ?? detailedResult?.percentage ?? 0}%
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3.5 text-center shadow-2xs dark:border-gray-800 dark:bg-gray-800">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Grade & Correct</div>
                <div className={`text-xs font-bold mt-2 ${
                  (detailedResult?.grade === "A" || detailedResult?.grade === "B" || Number(detailedResult?.correctPercent || detailedResult?.percentage) >= 60)
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  Grade: {detailedResult?.grade || "F"} ({detailedResult?.correctAnswers ?? detailedResult?.correctQuestionsCount ?? 0} Correct)
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3.5 text-center shadow-2xs dark:border-gray-800 dark:bg-gray-800">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Wrong & Skipped</div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
                  {detailedResult?.wrongAnswers ?? 0} Wrong ({detailedResult?.wrongPercent ?? "0.0"}%) • {detailedResult?.skippedQuestions ?? 0} Skipped ({detailedResult?.skippedPercent ?? "0.0"}%)
                </div>
              </div>
            </div>

            {/* Modal Body: Question Responses Breakdown */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
              {/* Question Review Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300">
                    <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Question Review
                  </h4>
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {detailedResult?.questions?.length || 10} Questions Total
                </span>
              </div>
              {auditLoading ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
                  <p className="text-xs">Loading detailed question audit...</p>
                </div>
              ) : auditError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {auditError}
                </div>
              ) : detailedResult?.questions?.length > 0 ? (
                detailedResult.questions.map((q, qIndex) => {
                  const relatedOptions = detailedResult.answerOptions?.filter(
                    (opt) => opt.questionId === q.questionsId
                  ) || [];

                  const isCorrect = Boolean(q.isStudentCorrect);
                  const isSkipped = q.attemptStatus === "NOT_ATTEMPTED";

                  let cardBorder = "border-2 border-[#10b981]";
                  if (isSkipped) {
                    cardBorder = "border-2 border-gray-200 dark:border-gray-700";
                  } else if (!isCorrect) {
                    cardBorder = "border-2 border-[#ef4444]";
                  }

                  return (
                    <div
                      key={q.questionsId || qIndex}
                      className={`rounded-2xl ${cardBorder} bg-white p-5 shadow-xs transition dark:bg-gray-800/50`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-700/60">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          Question {qIndex + 1}
                        </div>

                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <>
                              <span className="rounded-md bg-[#10b981] px-2.5 py-1 text-xs font-semibold text-white">
                                {q.studentPointsAwarded ?? 1}/{q.points ?? 1} points
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#10b981] px-2.5 py-1 text-xs font-semibold text-white">
                                ✓ Correct
                              </span>
                            </>
                          ) : isSkipped ? (
                            <>
                              <span className="rounded-md bg-gray-500 px-2.5 py-1 text-xs font-semibold text-white">
                                0/{q.points ?? 1} points
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-gray-500 px-2.5 py-1 text-xs font-semibold text-white">
                                Skipped
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="rounded-md bg-[#e11d48] px-2.5 py-1 text-xs font-semibold text-white">
                                {q.studentPointsAwarded ?? 0}/{q.points ?? 1} points
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#e11d48] px-2.5 py-1 text-xs font-semibold text-white">
                                ✕ Incorrect
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="mt-4 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                        {cleanHtml(q.questionText || q.title)}
                      </p>

                      {/* Options */}
                      <div className="mt-4 space-y-2.5">
                        {relatedOptions.map((opt, oIndex) => {
                          const isStudentChoice = Boolean(
                            opt.isStudentSelected ||
                            (q.studentSelectedOptions && String(q.studentSelectedOptions) === String(opt.answerId))
                          );
                          const isAnswerKey = Boolean(
                            opt.isCorrect ||
                            (q.correctAnswerData && String(q.correctAnswerData) === String(opt.answerId))
                          );

                          const formattedText = formatOptionText(opt.text, oIndex);

                          // 1. Correct Answer chosen by student (Screenshot 1)
                          if (isStudentChoice && isAnswerKey) {
                            return (
                              <div
                                key={opt.answerId || oIndex}
                                className="flex items-center justify-between rounded-xl border-2 border-[#10b981] bg-[#dcfce7]/70 px-4 py-3 text-xs md:text-sm text-gray-900 font-medium transition dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="size-4 shrink-0 rounded-full border-2 border-[#10b981] bg-white flex items-center justify-center dark:bg-gray-800">
                                    <span className="size-2 rounded-full bg-[#10b981]"></span>
                                  </span>
                                  <span>
                                    {formattedText}
                                    <span className="text-[#10b981] font-bold ml-1.5 dark:text-emerald-300">✓</span>
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // 2. Incorrect Answer chosen by student (Screenshot 2)
                          if (isStudentChoice && !isAnswerKey) {
                            return (
                              <div
                                key={opt.answerId || oIndex}
                                className="flex items-center justify-between rounded-xl border-2 border-[#f43f5e] bg-[#ffe4e6] px-4 py-3 text-xs md:text-sm text-gray-900 font-medium transition dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-100"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="size-4 shrink-0 rounded-full border-2 border-[#f43f5e] bg-white flex items-center justify-center dark:bg-gray-800">
                                    <span className="size-2 rounded-full bg-[#f43f5e]"></span>
                                  </span>
                                  <span>
                                    {formattedText}
                                    <span className="text-[#f43f5e] font-bold ml-1.5 dark:text-rose-400">✕</span>
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          // 3. The Correct Answer key not chosen by student (Screenshot 2)
                          if (isAnswerKey) {
                            return (
                              <div
                                key={opt.answerId || oIndex}
                                className="flex items-center justify-between rounded-xl border-2 border-[#facc15] bg-[#fef9c3] px-4 py-3 text-xs md:text-sm text-gray-900 font-medium transition dark:border-amber-500/80 dark:bg-amber-950/30 dark:text-amber-100"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="size-4 shrink-0 rounded-full border border-gray-400 bg-white dark:border-gray-500 dark:bg-gray-700"></span>
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span>{formattedText}</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-xs text-gray-900 dark:text-amber-200 ml-1">
                                      <span className="size-3.5 rounded-full bg-gray-900 text-white flex items-center justify-center text-[9px] font-bold">!</span>
                                      <span>Correct Answer</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // 4. Neutral Unselected Option
                          return (
                            <div
                              key={opt.answerId || oIndex}
                              className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3 text-xs md:text-sm text-gray-700 transition dark:border-gray-800 dark:bg-gray-800/30 dark:text-gray-300"
                            >
                              <div className="flex items-center gap-3">
                                <span className="size-4 shrink-0 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"></span>
                                <span>{formattedText}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Feedback */}
                      {q.studentFeedback && (
                        <div className="mt-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-2.5 text-[11px] text-gray-600 dark:text-gray-400">
                          <span className="font-bold text-gray-700 dark:text-gray-300">Feedback: </span>
                          {q.studentFeedback}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  No individual question audit logs available.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-4 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
