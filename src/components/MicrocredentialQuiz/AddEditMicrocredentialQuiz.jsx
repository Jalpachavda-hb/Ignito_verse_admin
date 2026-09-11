import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
  AngleLeftIcon,
} from "../../icons";
import {
  getEducationType,
  getStreamsDropdown,
  getMicrocredentialCoursesByStream,
  getMicrocredentialQuizCategoryList,
  saveDegreeQuizMaster,
  finalizeDegreeQuiz,
  fetchPaginatedMicrocredentialQuizList,
} from "../../services/AdminQuizPageService";

export default function AddEditMicrocredentialQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const quizIdParam = params.id ? Number(params.id) : 0;
  const isEditMode = Boolean(quizIdParam && quizIdParam > 0);

  // Loading & notification states
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown options
  const [educationTypes, setEducationTypes] = useState([]);
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    quizId: isEditMode ? quizIdParam : 0,
    educationTypeId: 2, // Microcredential Courses
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
    // Attempts & Category
    attemptsAllowed: 2,
    categoryId: 1,
    // Evaluation & Feedback
    deductPoints: false,
    deductionInPercentage: 0,
    autoPublishResults: true,
    syncToGradeBook: true,
  });

  // Load static dropdowns on mount
  useEffect(() => {
    let isMounted = true;

    async function loadDropdowns() {
      try {
        const [eduRes, streamRes, catRes] = await Promise.all([
          getEducationType(),
          getStreamsDropdown(),
          getMicrocredentialQuizCategoryList(),
        ]);

        if (!isMounted) return;

        if (eduRes?.success && Array.isArray(eduRes.educationList)) {
          setEducationTypes(eduRes.educationList);
        } else {
          setEducationTypes([
            { educationTypeId: 2, educationTypeName: "Microcredential Courses" },
          ]);
        }

        if (streamRes?.success && Array.isArray(streamRes.streamDataList)) {
          setStreams(streamRes.streamDataList);
        } else if (streamRes?.streamList) {
          setStreams(streamRes.streamList);
        }

        if (catRes?.success && Array.isArray(catRes.microcredentialQuizCategoryList)) {
          setCategories(catRes.microcredentialQuizCategoryList);
        } else {
          setCategories([
            { microcredentialQuizCategoryId: 1, microcredentialCategoryName: "General Assessment" },
            { microcredentialQuizCategoryId: 2, microcredentialCategoryName: "Module Checkpoint" },
            { microcredentialQuizCategoryId: 3, microcredentialCategoryName: "Final Certification Quiz" },
          ]);
        }
      } catch (err) {
        console.warn("Failed to load setup dropdowns:", err);
      }
    }

    loadDropdowns();

    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-fill when editing
  useEffect(() => {
    if (!isEditMode) return;
    let isMounted = true;

    async function loadExistingQuizData() {
      setLoadingInitial(true);
      const stateQuiz = location.state?.quiz || location.state?.item;

      if (stateQuiz) {
        applyQuizData(stateQuiz);
        setLoadingInitial(false);
        return;
      }

      // If not in state, attempt to fetch from quiz list
      try {
        const res = await fetchPaginatedMicrocredentialQuizList({
          pageNo: 1,
          pageSize: 100,
          educationTypeId: 2,
        });

        if (isMounted && res?.quizDegreeList) {
          const found = res.quizDegreeList.find(
            (q) => Number(q.quizId || q.QuizId) === Number(quizIdParam)
          );
          if (found) {
            applyQuizData(found);
          }
        }
      } catch (err) {
        console.warn("Could not find quiz in list:", err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    function applyQuizData(q) {
      let resolvedStreamId = q.streamId || q.StreamId || 0;
      if (!resolvedStreamId && (q.streamName || q.stream) && streams.length > 0) {
        const matched = streams.find(
          (s) =>
            (s.streamName || s.name)?.toLowerCase() ===
            (q.streamName || q.stream)?.toLowerCase()
        );
        if (matched) resolvedStreamId = matched.streamId || matched.id || 0;
      }

      setFormData((prev) => ({
        ...prev,
        quizId: quizIdParam,
        educationTypeId: q.educationTypeId || q.EducationTypeId || 2,
        streamId: Number(resolvedStreamId) || prev.streamId || 0,
        microcredentialCourseId:
          q.microcredentialCourseId || q.MicrocredentialCourseId || 0,
        yearRange: q.yearRange || "2026 - 2027",
        quizTitle: q.quizTitle || q.QuizTitle || "",
        gradeOutOf: q.gradeOutOf ?? q.GradeOutOf ?? 10,
        gradeBook: q.gradeBook || "In Grade Book",
        dueDate: q.dueDate || q.DueDate || "",
        quizDescription: q.quizDescription || q.QuizDescription || "",
        hasTimeLimit: Boolean(q.hasTimeLimit ?? true),
        timeLimitMinutes: q.timeLimitMinutes || 120,
        questionsPerPageId: q.questionsPerPageId || 1,
        preventPreviousBackNavigation: Boolean(
          q.preventPreviousBackNavigation ?? true
        ),
        shuffleQuestionsAndSections: Boolean(
          q.shuffleQuestionsAndSections ?? false
        ),
        allowHints: Boolean(q.allowHints ?? true),
        disableInternalMessages: Boolean(q.disableInternalMessages ?? false),
        headerDescription: q.headerDescription || "",
        footerDescription: q.footerDescription || "",
        startDate: q.startDate || "",
        startTime: q.startTime || "10:00",
        endDate: q.endDate || "",
        endTime: q.endTime || "18:00",
        password: q.password || "",
        attemptsAllowed: q.attemptsAllowed || 2,
        categoryId: q.categoryId || 1,
        deductPoints: Boolean(q.deductPoints ?? false),
        deductionInPercentage: q.deductionInPercentage || 0,
        autoPublishResults: Boolean(q.autoPublishResults ?? true),
        syncToGradeBook: Boolean(q.syncToGradeBook ?? true),
      }));
    }

    loadExistingQuizData();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, quizIdParam, streams]);

  // Load courses when streamId changes
  useEffect(() => {
    if (!formData.streamId) {
      setCourses([]);
      return;
    }

    let isMounted = true;
    async function loadCourses() {
      setLoadingCourses(true);
      try {
        const res = await getMicrocredentialCoursesByStream(formData.streamId);
        if (isMounted && res?.success && Array.isArray(res.microcredentialCourseOutputList)) {
          setCourses(res.microcredentialCourseOutputList);
        } else if (isMounted) {
          setCourses([]);
        }
      } catch (err) {
        console.warn("Error fetching courses for stream:", err);
        if (isMounted) setCourses([]);
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, [formData.streamId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStreamChange = (e) => {
    const sId = Number(e.target.value);
    setFormData((prev) => ({
      ...prev,
      streamId: sId,
      microcredentialCourseId: 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.quizTitle.trim()) {
      setErrorMessage("Please enter a Quiz Title.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.microcredentialCourseId && !formData.streamId) {
      setErrorMessage("Please select a Stream and Course for this quiz.");
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        window.scrollTo({ top: 0, behavior: "smooth" });
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

      const msg = isEditMode
        ? "Quiz updated successfully!"
        : "New microcredential quiz created successfully!";
      setSuccessMessage(msg);

      setTimeout(() => {
        navigate("/microcredential/quiz", {
          state: { successMessage: msg },
        });
      }, 1000);
    } catch (err) {
      console.error("Error saving quiz:", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving quiz.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full pb-16">
      <PageMeta
        title={`${isEditMode ? "Edit" : "Add"} Microcredential Quiz | IgnitoVerse Admin`}
        description="Configure quiz parameters, questions limit, time constraints, and grading options."
      />
      <PageBreadcrumb
        pageTitle={`${isEditMode ? "Edit" : "Add"} Microcredential Quiz`}
      />

      {/* Top Bar with Back Link */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <Link to="/" className="hover:text-brand-500 transition">
              Home
            </Link>
            <span>/</span>
            <Link to="/microcredential/quiz" className="hover:text-brand-500 transition">
              Microcredential Quizzes
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {isEditMode ? "Edit Quiz" : "Add Quiz"}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{isEditMode ? "Edit Microcredential Quiz" : "Add New Microcredential Quiz"}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure quiz details, stream & course association, time limits, and grading policy.
          </p>
        </div>

        <div>
          <Link
            to="/microcredential/quiz"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
          >
            <AngleLeftIcon className="size-3.5" />
            <span>Back to Quiz List</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-5 flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl transition-all shadow-sm">
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
        <div className="mb-5 flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl transition-all shadow-sm">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Course Association & Basic Quiz Details */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            1. Quiz Details & Course Association
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Select the education type, stream, and microcredential course for this quiz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Education Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Education Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.educationTypeId}
                onChange={(e) => handleChange("educationTypeId", Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {educationTypes.map((ed) => (
                  <option key={ed.educationTypeId} value={ed.educationTypeId}>
                    {ed.educationTypeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Stream */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Stream <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.streamId}
                onChange={handleStreamChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value={0}>-- Select Stream --</option>
                {streams.map((s) => (
                  <option key={s.streamId || s.id} value={s.streamId || s.id}>
                    {s.streamName || s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Microcredential Course */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Microcredential Course <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.microcredentialCourseId}
                onChange={(e) => handleChange("microcredentialCourseId", Number(e.target.value))}
                disabled={loadingCourses}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60"
              >
                <option value={0}>
                  {loadingCourses
                    ? "Loading courses..."
                    : formData.streamId
                    ? "-- Select Microcredential Course --"
                    : "-- Select Stream First --"}
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
                      Course #{formData.microcredentialCourseId}
                    </option>
                  )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5">
            {/* Year Range */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Year Range
              </label>
              <input
                type="text"
                placeholder="2026 - 2027"
                value={formData.yearRange}
                onChange={(e) => handleChange("yearRange", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Quiz Title */}
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mid-Term Assessment on Data Structures"
                value={formData.quizTitle}
                onChange={(e) => handleChange("quizTitle", e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Grade Out Of */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Grade Out Of
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.gradeOutOf}
                onChange={(e) => handleChange("gradeOutOf", Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Grade Book Association */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Grade Book
              </label>
              <input
                type="text"
                value={formData.gradeBook}
                onChange={(e) => handleChange("gradeBook", e.target.value)}
                placeholder="In Grade Book"
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quiz Description
            </label>
            <textarea
              rows={4}
              placeholder="Enter instructions, learning objectives, and scope of questions for students..."
              value={formData.quizDescription}
              onChange={(e) => handleChange("quizDescription", e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Section 2: Timing, Display & Access Restrictions */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            2. Timing, Display & Pacing Controls
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Configure examination time limits, questions distribution per page, and navigation restrictions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {/* Time Limit Setting */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.hasTimeLimit}
                  onChange={(e) => handleChange("hasTimeLimit", e.target.checked)}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                />
                <span className="text-xs font-semibold text-gray-800 dark:text-white">
                  Enforce Time Limit
                </span>
              </label>

              {formData.hasTimeLimit && (
                <div>
                  <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                    Time Limit in Minutes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={formData.timeLimitMinutes}
                    onChange={(e) => handleChange("timeLimitMinutes", Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Questions Per Page */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <label className="block text-xs font-semibold text-gray-800 dark:text-white mb-2">
                Questions Per Page
              </label>
              <select
                value={formData.questionsPerPageId}
                onChange={(e) => handleChange("questionsPerPageId", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value={1}>1 Question per page</option>
                <option value={5}>5 Questions per page</option>
                <option value={10}>10 Questions per page</option>
                <option value={0}>All Questions on single page</option>
              </select>
            </div>

            {/* Password Access */}
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <label className="block text-xs font-semibold text-gray-800 dark:text-white mb-2">
                Access Password (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank for open access"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.preventPreviousBackNavigation}
                onChange={(e) => handleChange("preventPreviousBackNavigation", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Prevent Back Navigation
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shuffleQuestionsAndSections}
                onChange={(e) => handleChange("shuffleQuestionsAndSections", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Shuffle Questions & Sections
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowHints}
                onChange={(e) => handleChange("allowHints", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Allow Hints During Quiz
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.disableInternalMessages}
                onChange={(e) => handleChange("disableInternalMessages", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Disable Student Messaging
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: Availability Window & Attempts */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            3. Availability Window & Attempts Allowed
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Specify the active dates and hours during which students can take this quiz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {/* Attempts Allowed */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Attempts Allowed
              </label>
              <select
                value={formData.attemptsAllowed}
                onChange={(e) => handleChange("attemptsAllowed", Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value={1}>1 Attempt Only</option>
                <option value={2}>2 Attempts</option>
                <option value={3}>3 Attempts</option>
                <option value={5}>5 Attempts</option>
                <option value={0}>Unlimited Attempts</option>
              </select>
            </div>

            {/* Quiz Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quiz Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleChange("categoryId", Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {categories.map((cat) => (
                  <option
                    key={cat.microcredentialQuizCategoryId}
                    value={cat.microcredentialQuizCategoryId}
                  >
                    {cat.microcredentialCategoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Evaluation, Grading & Feedback */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            4. Evaluation & Results Configuration
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Configure automatic scoring, grade publishing, and grade book synchronization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <input
                type="checkbox"
                checked={formData.autoPublishResults}
                onChange={(e) => handleChange("autoPublishResults", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-xs font-medium text-gray-800 dark:text-white">
                Auto-Publish Results Immediately
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <input
                type="checkbox"
                checked={formData.syncToGradeBook}
                onChange={(e) => handleChange("syncToGradeBook", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-xs font-medium text-gray-800 dark:text-white">
                Sync to Grade Book
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <input
                type="checkbox"
                checked={formData.deductPoints}
                onChange={(e) => handleChange("deductPoints", e.target.checked)}
                className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
              />
              <span className="text-xs font-medium text-gray-800 dark:text-white">
                Deduct Points for Incorrect Answers
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            to="/microcredential/quiz"
            className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-xs"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition shadow-xs flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin size-3.5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Saving Quiz...</span>
              </>
            ) : (
              <span>{isEditMode ? "Update Quiz" : "Save Quiz"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
