import React, { useState, useEffect } from "react";
import { CheckCircleIcon, CloseIcon, AlertIcon, InfoIcon } from "../../icons";
import { getStudentMicrocredentialQuizResponse } from "../../services/AdminQuizPageService";

export default function StudentQuizResponseModal({ item, onClose }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadResponses() {
      if (!item) return;
      setLoading(true);
      setErrorMessage("");

      try {
        const studentId = item.studentId || item.StudentId;
        const courseId = item.microcredentialCourseId || item.MicrocredentialCourseId;
        const videoId = item.videoId || item.VideoId;

        if (!studentId || !courseId || !videoId) {
          setData(null);
          return;
        }

        const res = await getStudentMicrocredentialQuizResponse(studentId, courseId, videoId);

        if (res?.success && (res.getStudentMicrocredentialQuizResponse?.length > 0 || res.quizSummary?.totalQuestions > 0)) {
          setData(res);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Error loading student quiz responses:", err);
        setErrorMessage("Failed to load student responses from server.");
      } finally {
        setLoading(false);
      }
    }

    loadResponses();
  }, [item]);

  const summary = data?.quizSummary || {
    totalQuestions: item?.totalQuestions || 0,
    rightQuestions: item?.correctAnswers || 0,
    wrongQuestions: item?.incorrectAnswers || 0,
    skippedQuestions: item?.skippedAnswers || 0
  };

  const responses = data?.getStudentMicrocredentialQuizResponse || [];
  const accuracy = summary.totalQuestions > 0
    ? Math.round((summary.rightQuestions / summary.totalQuestions) * 100)
    : item?.accuracyPercent || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-800 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              {item?.studentId && (
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                  Student ID: #{item.studentId}
                </span>
              )}
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {item?.studentName || "Learner Assessment Review"}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Course: <span className="font-semibold text-gray-700 dark:text-gray-300">{item?.courseName || "—"}</span> • Topic: <span className="font-semibold text-gray-700 dark:text-gray-300">{item?.topicName || "—"}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Performance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-center dark:border-gray-700/60 dark:bg-gray-700/30">
              <span className="block text-[11px] font-medium text-gray-500 dark:text-gray-400">Total</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{summary.totalQuestions}</span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <span className="block text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Correct</span>
              <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{summary.rightQuestions}</span>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/60 p-3 text-center dark:border-red-900/40 dark:bg-red-950/30">
              <span className="block text-[11px] font-medium text-red-700 dark:text-red-400">Incorrect</span>
              <span className="text-lg font-bold text-red-800 dark:text-red-300">{summary.wrongQuestions}</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center dark:border-amber-900/40 dark:bg-amber-950/30">
              <span className="block text-[11px] font-medium text-amber-700 dark:text-amber-400">Skipped</span>
              <span className="text-lg font-bold text-amber-800 dark:text-amber-300">{summary.skippedQuestions}</span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-brand-200 bg-brand-50/60 p-3 text-center dark:border-brand-900/40 dark:bg-brand-950/30">
              <span className="block text-[11px] font-medium text-brand-700 dark:text-brand-300">Accuracy</span>
              <span className="text-lg font-bold text-brand-800 dark:text-brand-300">{accuracy}%</span>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block size-6 animate-spin rounded-full border-3 border-brand-500 border-t-transparent mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Loading student answer sheets...</p>
            </div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {errorMessage}
            </div>
          ) : responses.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
              No detailed responses available for this attempt.
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Question Audit & Feedback
              </h4>

              {responses.map((resp, i) => {
                const isCorrect = (resp.answerStatus || "").toLowerCase() === "correct";
                const isSkipped = (resp.answerStatus || "").toLowerCase() === "skipped";

                return (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-700/80 dark:bg-gray-800/80"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Question {i + 1} {resp.topicName ? `• ${resp.topicName}` : ""}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : isSkipped
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                        }`}
                      >
                        {isCorrect ? "✓ Correct" : isSkipped ? "— Skipped" : "✕ Incorrect"}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
                      {resp.question}
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-700/40">
                        <span className="font-semibold text-gray-500 dark:text-gray-400 shrink-0 w-28">
                          Student's Answer:
                        </span>
                        <span className={`font-medium ${isCorrect ? "text-emerald-700 dark:text-emerald-300 font-semibold" : "text-red-700 dark:text-red-300 line-through"}`}>
                          {resp.studentAnswer || "No answer submitted"}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="flex items-start gap-2 rounded-lg bg-emerald-50/60 p-2.5 dark:bg-emerald-950/30">
                          <span className="font-semibold text-emerald-800 dark:text-emerald-400 shrink-0 w-28">
                            Correct Answer:
                          </span>
                          <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                            {resp.correctAnswer}
                          </span>
                        </div>
                      )}

                      {resp.explanation && (
                        <div className="rounded-lg border border-brand-100 bg-brand-50/40 p-2.5 text-[11px] text-brand-900 dark:border-brand-900/30 dark:bg-brand-950/20 dark:text-brand-300">
                          <span className="font-bold">Explanation: </span>
                          {resp.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-100 px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
