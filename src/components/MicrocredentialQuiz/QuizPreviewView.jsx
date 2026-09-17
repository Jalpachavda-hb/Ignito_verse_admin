import React, { useState, useEffect } from "react";
import { CheckCircleIcon, CloseIcon, InfoIcon, TimeIcon } from "../../icons";
import { getDegreeQuizQuestionsList } from "../../services/AdminQuizPageService";

export default function QuizPreviewView({ quiz, onExit }) {
  // 'student' | 'answerKey'
  const [previewMode, setPreviewMode] = useState("answerKey");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      if (!quiz?.quizId && !quiz?.QuizId) {
        setQuestions([]);
        return;
      }

      const qId = quiz.quizId || quiz.QuizId;
      setLoading(true);
      try {
        const res = await getDegreeQuizQuestionsList({ quizId: qId, pageSize: 50 });
        if (res?.success && Array.isArray(res.questionsList) && res.questionsList.length > 0) {
          const formatted = res.questionsList.map((item, index) => ({
            questionsId: item.questionsId || item.questionId || index + 1,
            question: item.question || item.questionText || `Question ${index + 1}`,
            points: item.points || 1,
            degreeQuestionType: item.degreeQuestionType || item.questionTypeId || 1,
            correctAnswerIndex: item.correctAnswerIndex ?? 0,
            explanation: item.explanation || "",
            options: Array.isArray(item.options) ? item.options : []
          }));
          setQuestions(formatted);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.warn("Failed to load backend questions:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [quiz]);

  const handleSelectOption = (qId, optionIdx) => {
    if (previewMode === "student") {
      setSelectedAnswers((prev) => ({
        ...prev,
        [qId]: optionIdx
      }));
    }
  };

  const scrollToQuestion = (idx) => {
    const el = document.getElementById(`preview-q-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0);
  const quizTitle = quiz?.quizTitle || quiz?.QuizTitle || "Microcredential Quiz Preview";

  const QUESTION_TYPE_NAMES = {
    1: "Multiple Choice",
    2: "True / False",
    3: "Fill in the Blank",
    4: "Multi-Select",
    5: "Matching",
    6: "Ordering",
    7: "Written Response",
    8: "Short Answer",
    9: "Arithmetic",
    10: "Significant Figures",
    11: "Multi Short Answer",
    12: "Likert Scale",
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen pb-16">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
          >
            <span>&larr;</span>
            <span>Exit Preview</span>
          </button>

          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
              {quizTitle}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {quiz?.moduleName ? `${quiz.moduleName} • ` : ""}
              {quiz?.microcredentialName || quiz?.streamName || "Microcredential Assessment Module"}
            </p>
          </div>
        </div>

        {/* Right Preview Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setPreviewMode("student")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                previewMode === "student"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Student Preview
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("answerKey")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                previewMode === "answerKey"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Answer Key Preview
            </button>
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/40 dark:text-brand-300">
            Total Quiz Points: {totalPoints} points
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Navigation Palette */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/60">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
                Questions Palette
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.questionsId] !== undefined;
                  return (
                    <button
                      key={q.questionsId}
                      type="button"
                      onClick={() => scrollToQuestion(idx)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-xs font-bold transition hover:scale-102 ${
                        previewMode === "answerKey"
                          ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                          : isAnswered
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      <span>{idx + 1}</span>
                      <span className="text-[10px] font-normal text-gray-400 dark:text-gray-400">
                        {previewMode === "answerKey" || isAnswered ? "✓" : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 dark:border-gray-700/60">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <InfoIcon className="size-4 text-brand-500" />
                  <span>Quiz Information</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Question Body */}
          <div className="lg:col-span-9 space-y-6">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-800">
                <div className="inline-block size-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading quiz questions preview...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">No questions available in this quiz.</p>
              </div>
            ) : (
              questions.map((q, idx) => {
                const userSelected = selectedAnswers[q.questionsId];
                return (
                  <div
                    key={q.questionsId}
                    id={`preview-q-${idx}`}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition dark:border-gray-800 dark:bg-gray-800"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 dark:border-gray-700/60">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          Question {idx + 1}
                        </span>
                        {q.degreeQuestionType && (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 border border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/60">
                            {QUESTION_TYPE_NAMES[q.degreeQuestionType] || `Type ${q.degreeQuestionType}`}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        ({q.points || 1} point)
                      </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 mb-5 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options List */}
                    <div className="space-y-3">
                      {(q.options || []).map((opt, optIdx) => {
                        const isCorrectOption = optIdx === q.correctAnswerIndex;
                        const isSelectedByStudent = userSelected === optIdx;

                        let rowStyle = "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 bg-white dark:bg-gray-800/70";
                        let textStyle = "text-gray-700 dark:text-gray-200";

                        if (previewMode === "answerKey") {
                          if (isCorrectOption) {
                            rowStyle = "border-emerald-300 bg-emerald-50/80 dark:border-emerald-700/60 dark:bg-emerald-950/30";
                            textStyle = "text-emerald-800 font-semibold dark:text-emerald-300";
                          }
                        } else if (previewMode === "student") {
                          if (isSelectedByStudent) {
                            rowStyle = "border-brand-400 bg-brand-50/50 dark:border-brand-600 dark:bg-brand-950/30";
                            textStyle = "text-brand-800 font-semibold dark:text-brand-200";
                          }
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.questionsId, optIdx)}
                            className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition ${rowStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                                  previewMode === "answerKey" && isCorrectOption
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : previewMode === "student" && isSelectedByStudent
                                    ? "border-brand-500 bg-brand-500 text-white"
                                    : "border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {optIdx + 1}
                              </span>
                              <span className={`text-sm ${textStyle}`}>
                                {opt}
                              </span>
                            </div>

                            {previewMode === "answerKey" && isCorrectOption && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                <CheckCircleIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box when in Answer Key Mode */}
                    {previewMode === "answerKey" && q.explanation && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
                        <span className="font-bold">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quiz Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Quiz Information
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Quiz Title:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{quizTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Total Points:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{totalPoints} points</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.dueDate || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Stream:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{quiz?.streamName || "General"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Time Limit:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">120 minutes</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 dark:text-gray-400">Attempts Allowed:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">2 attempts</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-full rounded-xl bg-brand-500 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition"
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
