import React, { useState, useEffect } from "react";
import { CloseIcon, CheckCircleIcon, AlertIcon } from "../../icons";
import {
  getEducationType,
  getStreamsDropdown,
  getMicrocredentialCoursesByStream,
  getMicrocredentialQuizCategoryList,
  saveDegreeQuizMaster,
  finalizeDegreeQuiz
} from "../../services/AdminQuizPageService";

export default function AddEditQuizModal({ isOpen, onClose, onQuizSaved, editQuiz = null }) {
  const isEdit = Boolean(editQuiz && (editQuiz.quizId || editQuiz.QuizId));

  // Accordion active sections
  const [openAccordions, setOpenAccordions] = useState({
    availability: false,
    timing: true,
    attempts: false,
    evaluation: false
  });

  const toggleAccordion = (sec) => {
    setOpenAccordions((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Dropdown options
  const [educationTypes, setEducationTypes] = useState([]);
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    quizId: 0,
    educationTypeId: 2, // Microcredential
    streamId: 0,
    microcredentialCourseId: 0,
    yearRange: "2026 - 2027",
    quizTitle: "",
    gradeOutOf: 10,
    gradeBook: "In Grade Book",
    dueDate: "",
    quizDescription: "",
    // Timing & Display
    hasTimeLimit: true,
    timeLimitMinutes: 120,
    questionsPerPageId: 1,
    preventPreviousBackNavigation: true,
    shuffleQuestionsAndSections: false,
    allowHints: true,
    disableInternalMessages: false,
    headerDescription: "",
    footerDescription: "",
    // Availability
    startDate: "",
    startTime: "10:00",
    endDate: "",
    endTime: "18:00",
    password: "",
    // Attempts & Completion
    attemptsAllowed: 2,
    categoryId: 1,
    // Evaluation & Feedback
    deductPoints: false,
    deductionInPercentage: 0,
    autoPublishResults: true,
    syncToGradeBook: true
  });

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load dropdowns on open
  useEffect(() => {
    if (!isOpen) return;

    async function loadDropdowns() {
      try {
        const [eduRes, streamRes, catRes] = await Promise.all([
          getEducationType(),
          getStreamsDropdown(),
          getMicrocredentialQuizCategoryList()
        ]);

        if (eduRes?.success && Array.isArray(eduRes.educationList)) {
          setEducationTypes(eduRes.educationList);
        } else {
          setEducationTypes([{ educationTypeId: 2, educationTypeName: "Microcredential Courses" }]);
        }

        if (streamRes?.success && Array.isArray(streamRes.streamDataList)) {
          setStreams(streamRes.streamDataList);
        } else if (streamRes?.streamList) {
          setStreams(streamRes.streamList);
        }

        if (catRes?.success && Array.isArray(catRes.microcredentialQuizCategoryList)) {
          setCategories(catRes.microcredentialQuizCategoryList);
        }
      } catch (err) {
        console.warn("Failed to load setup dropdowns:", err);
      }
    }

    loadDropdowns();
  }, [isOpen]);

  // Load courses when stream changes
  useEffect(() => {
    async function loadCourses() {
      if (!formData.streamId) {
        setCourses([]);
        return;
      }
      try {
        const res = await getMicrocredentialCoursesByStream(formData.streamId);
        if (res?.success && Array.isArray(res.microcredentialCourseOutputList)) {
          setCourses(res.microcredentialCourseOutputList);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.warn("Error fetching courses for stream:", err);
        setCourses([]);
      }
    }

    loadCourses();
  }, [formData.streamId]);

  // Prefill if editing, or reset if adding
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    setSuccessMessage("");

    if (editQuiz) {
      let resolvedStreamId = editQuiz.streamId || editQuiz.StreamId || 0;
      if (!resolvedStreamId && (editQuiz.streamName || editQuiz.stream) && streams.length > 0) {
        const matched = streams.find(
          (s) =>
            (s.streamName || s.name)?.toLowerCase() ===
            (editQuiz.streamName || editQuiz.stream)?.toLowerCase()
        );
        if (matched) resolvedStreamId = matched.streamId || matched.id || 0;
      }

      setFormData({
        quizId: editQuiz.quizId || editQuiz.QuizId || 0,
        educationTypeId: editQuiz.educationTypeId || editQuiz.EducationTypeId || 2,
        streamId: Number(resolvedStreamId) || 0,
        microcredentialCourseId:
          editQuiz.microcredentialCourseId || editQuiz.MicrocredentialCourseId || 0,
        yearRange: editQuiz.yearRange || "2026 - 2027",
        quizTitle: editQuiz.quizTitle || editQuiz.QuizTitle || "",
        gradeOutOf: editQuiz.gradeOutOf ?? editQuiz.GradeOutOf ?? 10,
        gradeBook: editQuiz.gradeBook || "In Grade Book",
        dueDate: editQuiz.dueDate || editQuiz.DueDate || "",
        quizDescription: editQuiz.quizDescription || editQuiz.QuizDescription || "",
        hasTimeLimit: Boolean(editQuiz.hasTimeLimit ?? true),
        timeLimitMinutes: editQuiz.timeLimitMinutes || 120,
        questionsPerPageId: editQuiz.questionsPerPageId || 1,
        preventPreviousBackNavigation: Boolean(
          editQuiz.preventPreviousBackNavigation ?? true
        ),
        shuffleQuestionsAndSections: Boolean(
          editQuiz.shuffleQuestionsAndSections ?? false
        ),
        allowHints: Boolean(editQuiz.allowHints ?? true),
        disableInternalMessages: Boolean(
          editQuiz.disableInternalMessages ?? false
        ),
        headerDescription: editQuiz.headerDescription || "",
        footerDescription: editQuiz.footerDescription || "",
        startDate: editQuiz.startDate || "",
        startTime: editQuiz.startTime || "10:00",
        endDate: editQuiz.endDate || "",
        endTime: editQuiz.endTime || "18:00",
        password: editQuiz.password || "",
        attemptsAllowed: editQuiz.attemptsAllowed || 2,
        categoryId: editQuiz.categoryId || 1,
        deductPoints: Boolean(editQuiz.deductPoints ?? false),
        deductionInPercentage: editQuiz.deductionInPercentage || 0,
        autoPublishResults: Boolean(editQuiz.autoPublishResults ?? true),
        syncToGradeBook: Boolean(editQuiz.syncToGradeBook ?? true),
      });
    } else {
      setFormData({
        quizId: 0,
        educationTypeId: 2,
        streamId: 0,
        microcredentialCourseId: 0,
        yearRange: "2026 - 2027",
        quizTitle: "",
        gradeOutOf: 10,
        gradeBook: "In Grade Book",
        dueDate: "",
        quizDescription: "",
        hasTimeLimit: true,
        timeLimitMinutes: 120,
        questionsPerPageId: 1,
        preventPreviousBackNavigation: true,
        shuffleQuestionsAndSections: false,
        allowHints: true,
        disableInternalMessages: false,
        headerDescription: "",
        footerDescription: "",
        startDate: "",
        startTime: "10:00",
        endDate: "",
        endTime: "18:00",
        password: "",
        attemptsAllowed: 2,
        categoryId: 1,
        deductPoints: false,
        deductionInPercentage: 0,
        autoPublishResults: true,
        syncToGradeBook: true,
      });
    }
  }, [editQuiz, streams, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (andClose = false) => {
    if (!formData.quizTitle.trim()) {
      setErrorMessage("Please enter a Quiz Title.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Step 1: Save Quiz Master
      const masterRes = await saveDegreeQuizMaster(formData);
      if (!masterRes || masterRes.success === false) {
        setErrorMessage(masterRes?.message || "Failed to save Quiz Master.");
        setSaving(false);
        return;
      }

      const assignedQuizId = masterRes.quizId || formData.quizId;

      // Step 2: Finalize Quiz Settings
      try {
        const finalizeRes = await finalizeDegreeQuiz({
          ...formData,
          quizId: assignedQuizId,
        });
        if (finalizeRes && finalizeRes.success === false) {
          console.warn("finalizeDegreeQuiz notice:", finalizeRes.message);
        }
      } catch (fErr) {
        console.warn("finalizeDegreeQuiz error:", fErr);
      }

      setSuccessMessage(isEdit ? "Quiz updated successfully!" : "Quiz saved successfully!");
      if (onQuizSaved) {
        onQuizSaved();
      }
      if (andClose) {
        setTimeout(() => {
          onClose();
        }, 700);
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
      setErrorMessage(err.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-800 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEdit ? "Edit Microcredential Quiz" : "Add New Microcredential Quiz"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure quiz parameters, course links, timing restrictions, and evaluation settings
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

        {/* Notifications */}
        {successMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/40 dark:text-emerald-300">
            <CheckCircleIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-800 dark:bg-red-950/40 dark:border-red-900/40 dark:text-red-300">
            <AlertIcon className="size-4 text-red-600 dark:text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body: Left Form + Right Accordion Settings */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Basic Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                1. Quiz Setup & Course Details
              </h4>

              {/* Education Type & Stream */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Education Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.educationTypeId}
                    onChange={(e) => handleChange("educationTypeId", Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {educationTypes.map((ed) => (
                      <option key={ed.educationTypeId} value={ed.educationTypeId}>
                        {ed.educationTypeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Stream <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.streamId}
                    onChange={(e) => handleChange("streamId", Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value={0}>Select Stream...</option>
                    {streams.map((s) => (
                      <option key={s.streamId} value={s.streamId}>
                        {s.streamName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Microcredential Course */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Microcredential Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.microcredentialCourseId}
                  onChange={(e) => handleChange("microcredentialCourseId", Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  <option value={0}>
                    {formData.streamId ? "Select Course..." : "Select Stream First"}
                  </option>
                  {courses.map((c) => (
                    <option key={c.microcredentialCourseId} value={c.microcredentialCourseId}>
                      {c.microcredentialCourseName}
                    </option>
                  ))}
                  {formData.microcredentialCourseId > 0 &&
                    !courses.some(
                      (c) => Number(c.microcredentialCourseId) === Number(formData.microcredentialCourseId)
                    ) && (
                      <option value={formData.microcredentialCourseId}>
                        {editQuiz?.microcredentialCourseName ||
                          editQuiz?.microcredentialName ||
                          `Course #${formData.microcredentialCourseId}`}
                      </option>
                    )}
                </select>
              </div>

              {/* Year Range & Quiz Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Year Range
                  </label>
                  <input
                    type="text"
                    value={formData.yearRange}
                    onChange={(e) => handleChange("yearRange", e.target.value)}
                    placeholder="2026 - 2027"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Quiz Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.quizTitle}
                    onChange={(e) => handleChange("quizTitle", e.target.value)}
                    placeholder="e.g., Relaxation Techniques Quiz - 1"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Grade Out Of, Grade Book, Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Grade Out Of
                  </label>
                  <input
                    type="number"
                    value={formData.gradeOutOf}
                    onChange={(e) => handleChange("gradeOutOf", Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Grade Book
                  </label>
                  <select
                    value={formData.gradeBook}
                    onChange={(e) => handleChange("gradeBook", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value="In Grade Book">In Grade Book</option>
                    <option value="Not in Grade Book">Not in Grade Book</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Quiz Description
                </label>
                <textarea
                  rows={4}
                  value={formData.quizDescription}
                  onChange={(e) => handleChange("quizDescription", e.target.value)}
                  placeholder="Provide concise instructions, requirements, or syllabus coverage details for students..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Right Column: Settings Accordion (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                2. Parameters & Restrictions
              </h4>

              {/* Accordion 1: Timing & Display */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/80 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("timing")}
                  className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 text-xs font-bold text-gray-800 dark:bg-gray-700/50 dark:text-gray-200"
                >
                  <span>Timing & Display</span>
                  <span>{openAccordions.timing ? "▲" : "▼"}</span>
                </button>

                {openAccordions.timing && (
                  <div className="p-4 space-y-3 text-xs border-t border-gray-100 dark:border-gray-700/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasTimeLimit}
                        onChange={(e) => handleChange("hasTimeLimit", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Set time limit</span>
                    </label>

                    {formData.hasTimeLimit && (
                      <div className="flex items-center gap-2 pl-6">
                        <input
                          type="number"
                          value={formData.timeLimitMinutes}
                          onChange={(e) => handleChange("timeLimitMinutes", Number(e.target.value))}
                          className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <span className="text-gray-500 dark:text-gray-400">minute(s)</span>
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preventPreviousBackNavigation}
                        onChange={(e) => handleChange("preventPreviousBackNavigation", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Prevent going back to previous pages</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shuffleQuestionsAndSections}
                        onChange={(e) => handleChange("shuffleQuestionsAndSections", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Shuffle questions & choices</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowHints}
                        onChange={(e) => handleChange("allowHints", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Allow hints</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Accordion 2: Attempts & Completion */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/80 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("attempts")}
                  className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 text-xs font-bold text-gray-800 dark:bg-gray-700/50 dark:text-gray-200"
                >
                  <span>Attempts & Completion</span>
                  <span>{openAccordions.attempts ? "▲" : "▼"}</span>
                </button>

                {openAccordions.attempts && (
                  <div className="p-4 space-y-3 text-xs border-t border-gray-100 dark:border-gray-700/50">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Attempts Allowed
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.attemptsAllowed}
                        onChange={(e) => handleChange("attemptsAllowed", Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Quiz Category
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => handleChange("categoryId", Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.microcredentialQuizCategoryId} value={cat.microcredentialQuizCategoryId}>
                            {cat.microcredentialCategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Evaluation & Feedback */}
              <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/80 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion("evaluation")}
                  className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 text-xs font-bold text-gray-800 dark:bg-gray-700/50 dark:text-gray-200"
                >
                  <span>Evaluation & Feedback</span>
                  <span>{openAccordions.evaluation ? "▲" : "▼"}</span>
                </button>

                {openAccordions.evaluation && (
                  <div className="p-4 space-y-2.5 text-xs border-t border-gray-100 dark:border-gray-700/50">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.autoPublishResults}
                        onChange={(e) => handleChange("autoPublishResults", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Auto-publish attempt results immediately
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.syncToGradeBook}
                        onChange={(e) => handleChange("syncToGradeBook", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Synchronize to grade book on publish
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.deductPoints}
                        onChange={(e) => handleChange("deductPoints", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        Deduct points for incorrect answers
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 p-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-xl border border-brand-500 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 transition"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition"
          >
            {saving ? "Saving..." : "Save and Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
