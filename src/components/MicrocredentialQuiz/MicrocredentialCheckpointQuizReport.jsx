import React, { useState, useEffect, useCallback, useMemo } from "react";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import { EyeIcon } from "../../icons";
import { getMicrocredentialCheckpointQuizReport } from "../../services/AdminQuizPageService";
import StudentQuizResponseModal from "./StudentQuizResponseModal";

export default function MicrocredentialCheckpointQuizReport() {
  const [studentReports, setStudentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentForResponses, setSelectedStudentForResponses] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadStudentReports = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await getMicrocredentialCheckpointQuizReport({
        pageNo: currentPage,
        pageSize: pageSize,
        orderByColumn: "StudentName",
        orderByDirection: "asc",
        searchInput: studentSearch.trim()
      });

      if (res?.success && Array.isArray(res.getMicrocredentialCheckpointQuizReportData)) {
        setStudentReports(res.getMicrocredentialCheckpointQuizReportData);
        setTotalRecords(res.pageDetail?.totalRecords || res.getMicrocredentialCheckpointQuizReportData.length);
      } else {
        setErrorMessage(res?.message || "Failed to load student checkpoint quiz reports.");
        setStudentReports([]);
      }
    } catch (err) {
      console.error("Failed to load student reports:", err);
      setErrorMessage(err.message || "Failed to connect to Checkpoint Quiz Report API.");
      setStudentReports([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, studentSearch]);

  useEffect(() => {
    loadStudentReports();
  }, [loadStudentReports]);

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const totalAttempts = totalRecords || studentReports.length;
    if (studentReports.length === 0) {
      return { totalAttempts: 0, avgAccuracy: 0, totalQuestions: 0, passCount: 0 };
    }

    const sumAccuracy = studentReports.reduce((sum, r) => sum + (Number(r.accuracyPercent) || 0), 0);
    const sumQuestions = studentReports.reduce((sum, r) => sum + (Number(r.totalQuestions) || 0), 0);
    const pass = studentReports.filter((r) => (Number(r.accuracyPercent) || 0) >= 70).length;

    return {
      totalAttempts,
      avgAccuracy: Math.round(sumAccuracy / studentReports.length),
      totalQuestions: sumQuestions,
      passCount: pass
    };
  }, [studentReports, totalRecords]);

  return (
    <div className="w-full pb-16">
      <PageMeta
        title="Microcredential Checkpoint Quiz Report | IgnitoVerse Admin"
        description="Comprehensive evaluation analytics and student response audits for video checkpoint quizzes."
      />
      <PageBreadcrumb pageTitle="Microcredential Checkpoint Quiz Report" />

      {/* Main Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 mb-2">
              <span>📊 Learner Insights & Live Checkpoint Audits</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Student Quiz Performance & Responses
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time learner checkpoint attempts, accuracy metrics, and question-by-question response breakdown
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search student or course..."
              className="rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />

            <button
              type="button"
              onClick={loadStudentReports}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
            >
              <span>↻ Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="rounded-2xl border border-brand-100 bg-linear-to-br from-brand-50/40 to-white p-5 shadow-xs dark:border-brand-900/40 dark:from-brand-950/30 dark:to-gray-800/40">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">Total Attempts</span>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {metrics.totalAttempts}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Learners evaluated</span>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-linear-to-br from-emerald-50/40 to-white p-5 shadow-xs dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-gray-800/40">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Average Accuracy</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {metrics.avgAccuracy}%
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Across all topics</span>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50/40 to-white p-5 shadow-xs dark:border-blue-900/40 dark:from-blue-950/30 dark:to-gray-800/40">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">Questions Answered</span>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {metrics.totalQuestions}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Total audited items</span>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-linear-to-br from-purple-50/40 to-white p-5 shadow-xs dark:border-purple-900/40 dark:from-purple-950/30 dark:to-gray-800/40">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-300">Passed Criteria</span>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
              {metrics.passCount}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">&ge; 70% threshold</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300">
                  Learner Name & ID
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300">
                  Course & Topic
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  Questions
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300">
                  Accuracy %
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  Results Breakdown
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 dark:text-gray-300">
                  Last Attempt Time
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-bold text-gray-600 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-transparent text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
                    <div>Loading student checkpoint reports...</div>
                  </td>
                </tr>
              ) : studentReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No student quiz reports found.
                  </td>
                </tr>
              ) : (
                studentReports.map((st, i) => {
                  const acc = Number(st.accuracyPercent) || 0;
                  return (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                    >
                      {/* Learner */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-9 flex items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs dark:bg-brand-950 dark:text-brand-300">
                            {st.studentName ? st.studentName.charAt(0) : "S"}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white block">
                              {st.studentName || "Anonymous Learner"}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              ID: #{st.studentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course & Topic */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-[11px]">
                          {st.courseName}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          {st.topicName}
                        </div>
                      </td>

                      {/* Questions */}
                      <td className="px-5 py-4 text-center font-bold text-gray-800 dark:text-gray-200">
                        {st.totalQuestions}
                      </td>

                      {/* Accuracy % */}
                      <td className="px-5 py-4">
                        <div className="w-32 space-y-1.5">
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {acc}%
                          </span>
                          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                acc >= 70 ? "bg-emerald-500" : acc >= 50 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, acc))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Results Breakdown */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" title="Correct Answers">
                            ✓ {st.correctAnswers}
                          </span>
                          <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300" title="Incorrect Answers">
                            ✕ {st.incorrectAnswers}
                          </span>
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400" title="Skipped Answers">
                            — {st.skippedAnswers}
                          </span>
                        </div>
                      </td>

                      {/* Last Attempt Time */}
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                        {st.lastAttemptTime || "—"}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForResponses(st)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300 transition"
                        >
                          <EyeIcon className="size-3.5" />
                          <span>View Responses</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 mt-4">
          <div>
            Showing {studentReports.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
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

      {/* Response Audit Modal */}
      {selectedStudentForResponses && (
        <StudentQuizResponseModal
          item={selectedStudentForResponses}
          onClose={() => setSelectedStudentForResponses(null)}
        />
      )}
    </div>
  );
}
