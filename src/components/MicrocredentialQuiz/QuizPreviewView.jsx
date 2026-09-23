import React, { useState, useEffect } from "react";
import { CheckCircleIcon, CloseIcon, InfoIcon, TimeIcon } from "../../icons";
import { getDegreeQuizPreviewByQuizId } from "../../services/AdminQuizPageService";

export default function QuizPreviewView({ quiz, onExit }) {
  // 'student' | 'answerKey'
  const [previewMode, setPreviewMode] = useState("answerKey");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [quizMetadata, setQuizMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPreview() {
      if (!quiz?.quizId && !quiz?.QuizId) {
        setQuestions([]);
        return;
      }

      const qId = Number(quiz.quizId || quiz.QuizId);
      setLoading(true);
      try {
        const res = await getDegreeQuizPreviewByQuizId(qId);
        if (res?.success && Array.isArray(res.questions) && res.questions.length > 0) {
          setQuestions(res.questions);
          setQuizMetadata({
            quizName: res.quizName || quiz?.quizTitle || quiz?.QuizTitle || "Microcredential Quiz Preview",
            quizDescription: res.quizDescription || quiz?.quizDescription || "",
            timeLimit: res.timeLimit || "120 minutes",
            attemptsAllowed: res.attemptsAllowed || "1 attempt",
            availabilityPeriod: res.availabilityPeriod || "Always Active",
            totalQuestionsPoints: res.totalQuestionsPoints || res.totalPoints,
            totalPoints: res.totalPoints
          });
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.warn("Failed to load quiz preview via DegreeQuizPerviewGetByQuizId:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    loadPreview();
  }, [quiz]);

  useEffect(() => {
    if (quiz?.autoPrint && !loading && questions.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [quiz?.autoPrint, loading, questions.length]);

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
  const quizTitle = quizMetadata?.quizName || quiz?.quizTitle || quiz?.QuizTitle || "Microcredential Quiz Preview";

  const QUESTION_TYPE_NAMES = {
    1: "Multiple Choice",
    2: "True / False",
    3: "Fill in the Blank",
    4: "Multi-Select",
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen pb-16 print:bg-white print:min-h-0 print:pb-0">
      {/* Top Sticky Header - Hidden on Print */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 shadow-xs print:hidden">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
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
              {quiz?.microcredentialName || quiz?.streamName || "Microcredential Assessment Quiz"}
            </p>
          </div>
        </div>

        {/* Right Preview Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            title="Print Quiz"
          >
            <span className="text-sm">🖨️</span>
            <span>Print</span>
          </button>

          <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setPreviewMode("student")}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
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
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 print:max-w-full print:m-0 print:p-0">
        {/* Printable Quiz Title Header (Only shown when printing) */}
        <div className="hidden print:block mb-6 border-b border-gray-300 pb-3">
          <h1 className="text-2xl font-bold text-black">{quizTitle}</h1>
          {(quiz?.moduleName || quiz?.microcredentialName || quiz?.streamName) && (
            <p className="text-xs text-gray-600 mt-1">
              {quiz?.moduleName ? `${quiz.moduleName} • ` : ""}
              {quiz?.microcredentialName || quiz?.streamName || "Microcredential Assessment Quiz"}
            </p>
          )}
          <div className="flex gap-4 mt-2 text-xs text-gray-600">
            <span>Total Questions: {questions.length}</span>
            <span>•</span>
            <span>Total Points: {totalPoints} {totalPoints === 1 ? "point" : "points"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          {/* Left Navigation Palette - Hidden on Print */}
          <div className="lg:col-span-3 print:hidden">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-800/60">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">
                Questions Palette ({questions.length})
              </h2>

              <div className="grid grid-cols-4 sm:grid-cols-3 gap-2 mb-5">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.questionsId] !== undefined;
                  return (
                    <button
                      key={q.questionsId || idx}
                      type="button"
                      onClick={() => scrollToQuestion(idx)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2 text-xs font-bold transition hover:scale-102 cursor-pointer ${
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  <InfoIcon className="size-4 text-brand-500" />
                  <span>Quiz Information</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Question Body */}
          <div className="lg:col-span-9 space-y-6 print:w-full print:space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-800">
                <div className="inline-block size-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading quiz questions preview from DegreeQuizAPI...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">No questions available in this quiz preview.</p>
              </div>
            ) : (
              questions.map((q, idx) => {
                const userSelected = selectedAnswers[q.questionsId];
                const qType = Number(q.degreeQuestionType || 1);

                return (
                  <div
                    key={q.questionsId || idx}
                    id={`preview-q-${idx}`}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition dark:border-gray-800 dark:bg-gray-800 print:border-gray-300 print:shadow-none print:break-inside-avoid print:bg-white print:p-4 print:mb-4"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 dark:border-gray-700/60 print:border-gray-200 print:pb-2 print:mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white print:text-black">
                          Question {idx + 1}
                        </span>
                        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold text-brand-700 border border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800/60 print:bg-gray-100 print:border-gray-300 print:text-gray-800">
                          {QUESTION_TYPE_NAMES[qType] || `Type ${qType}`}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 print:text-gray-700">
                        ({q.points || 1} {q.points === 1 ? "point" : "points"})
                      </span>
                    </div>

                    {/* Question Text (rendered safely) */}
                    <div
                      className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100 mb-5 leading-relaxed prose dark:prose-invert max-w-none print:text-black print:mb-3"
                      dangerouslySetInnerHTML={{ __html: q.questionText || q.question }}
                    />

                    {/* TYPE 1, 2, 4: Options List */}
                    {(qType === 1 || qType === 2 || qType === 4 || Array.isArray(q.options)) && q.options && q.options.length > 0 && (
                      <div className="space-y-3">
                        {q.options.map((opt, optIdx) => {
                          const optText = typeof opt === "string" ? opt : (opt.text || opt.Text || `Option ${optIdx + 1}`);
                          const isCorrectOption = typeof opt === "object" ? Boolean(opt.isCorrect ?? opt.IsCorrect) : (optIdx === q.correctAnswerIndex);
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
                              key={opt.answerId || optIdx}
                              onClick={() => handleSelectOption(q.questionsId, optIdx)}
                              className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition ${rowStyle} print:border-gray-300 print:p-2.5 print:mb-2 print:bg-white print:shadow-none`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                                    previewMode === "answerKey" && isCorrectOption
                                      ? "border-emerald-500 bg-emerald-500 text-white print:border-emerald-700 print:bg-emerald-600"
                                      : previewMode === "student" && isSelectedByStudent
                                      ? "border-brand-500 bg-brand-500 text-white print:border-gray-700 print:bg-gray-600"
                                      : "border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400 print:border-gray-400 print:text-black"
                                  }`}
                                >
                                  {optIdx + 1}
                                </span>
                                <span className={`text-sm ${textStyle} print:text-black`}>
                                  {optText}
                                </span>
                              </div>

                              {previewMode === "answerKey" && isCorrectOption && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 print:border print:border-emerald-600 print:bg-emerald-50 print:text-emerald-800">
                                  <CheckCircleIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* TYPE 3: Fill in the Blank view */}
                    {qType === 3 && q.blankAnswers && q.blankAnswers.length > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50 space-y-2 print:border-gray-300 print:bg-white print:p-3">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 print:text-black">
                          Blank Answer Key:
                        </span>
                        {q.blankAnswers.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                              Expected Answer: {b.correctAnswer || b.CorrectAnswer}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hint Box (if any) */}
                    {q.hint && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 print:border-gray-300 print:bg-gray-50 print:text-gray-800">
                        <span className="font-bold">Hint: </span>
                        {q.hint}
                      </div>
                    )}

                    {/* Explanation / Feedback Box when in Answer Key Mode */}
                    {previewMode === "answerKey" && (q.questionFeedback || q.explanation) && (
                      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300 print:border-gray-300 print:bg-gray-50 print:text-gray-800">
                        <span className="font-bold">Explanation: </span>
                        {q.questionFeedback || q.explanation}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Quiz Information
              </h3>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
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
                <span className="text-gray-500 dark:text-gray-400">Time Limit:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{quizMetadata?.timeLimit || "120 minutes"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Attempts Allowed:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{quizMetadata?.attemptsAllowed || "1 attempt"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Availability:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{quizMetadata?.availabilityPeriod || "Active"}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-full rounded-xl bg-brand-500 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition cursor-pointer"
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
