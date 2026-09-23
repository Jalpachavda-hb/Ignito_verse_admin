import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
  AngleLeftIcon,
  CalenderIcon,
  TimeIcon,
} from "../../icons";
import {
  getStreamsDropdown,
  getMicrocredentialCoursesByStream,
  getMicrocredentialModuleByCourseId,
  saveDegreeQuizMaster,
  getDegreeQuizDetailsByQuizId,
  finalizeDegreeQuiz,
  fetchPaginatedMicrocredentialQuizList,
} from "../../services/AdminQuizPageService";
import QuestionMasterModal from "./QuestionMasterModal";

/**
 * Normalizes date to clean YYYY-MM-DD string
 */
export function formatDateOnly(val) {
  if (!val) return "";
  const str = String(val).trim();
  if (!str) return "";
  if (str.includes("T")) {
    return str.split("T")[0];
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return str;
}

/**
 * Normalizes time to clean 12-hour hh:mm AM/PM string
 */
export function formatTimeOnly(timeVal) {
  if (!timeVal) return "";
  const str = String(timeVal).trim();
  if (!str) return "";
  if (/am|pm/i.test(str)) return str;
  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
  }
  return str;
}

/**
 * Reusable Themed Date Picker Component based on Flatpickr
 */
function ThemedDatePicker({ value, onChange, placeholder = "YYYY-MM-DD", disabled = false }) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);
  const cleanDate = formatDateOnly(value);

  useEffect(() => {
    if (!inputRef.current) return;
    fpRef.current = flatpickr(inputRef.current, {
      dateFormat: "Y-m-d",
      static: true,
      monthSelectorType: "static",
      defaultDate: cleanDate || undefined,
      clickOpens: true,
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onChange: (selectedDates, dateStr) => {
        if (onChange) onChange(dateStr);
      },
    });

    return () => {
      if (fpRef.current && !Array.isArray(fpRef.current)) {
        fpRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (fpRef.current && cleanDate !== undefined) {
      fpRef.current.setDate(cleanDate || "", false);
    }
  }, [cleanDate]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={cleanDate}
        className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-10 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <CalenderIcon className="size-4" />
      </span>
    </div>
  );
}

/**
 * Reusable Themed Time Picker Component based on Flatpickr (12-hour AM/PM)
 */
function ThemedTimePicker({ value, onChange, placeholder = "hh:mm AM/PM", disabled = false }) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);
  const cleanTime = formatTimeOnly(value);

  useEffect(() => {
    if (!inputRef.current) return;
    fpRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "h:i K", // 12-hour format with AM/PM e.g. "10:00 AM"
      time_24hr: false,
      defaultDate: cleanTime || undefined,
      clickOpens: true,
      static: true,
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onChange: (selectedDates, dateStr) => {
        if (onChange) onChange(dateStr);
      },
    });

    return () => {
      if (fpRef.current && !Array.isArray(fpRef.current)) {
        fpRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (fpRef.current && cleanTime !== undefined) {
      fpRef.current.setDate(cleanTime || "", false);
    }
  }, [cleanTime]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={cleanTime}
        className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-10 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <TimeIcon className="size-4" />
      </span>
    </div>
  );
}

export default function AddEditMicrocredentialQuiz({
  modalMode = false,
  modalQuiz = null,
  onModalClose = null,
  onModalSaved = null,
} = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const quizIdParam = modalQuiz
    ? Number(modalQuiz.quizId || modalQuiz.QuizId || 0)
    : params.id
    ? Number(params.id)
    : 0;
  const isEditMode = Boolean(quizIdParam && quizIdParam > 0);

  // Loading & notification states
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Dropdown options
  const [streams, setStreams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);

  // Cached display names for smooth pre-fill in edit mode
  const [cachedCourseName, setCachedCourseName] = useState("");
  const [cachedModuleName, setCachedModuleName] = useState("");
  const [cachedStreamName, setCachedStreamName] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    quizId: isEditMode ? quizIdParam : 0,
    educationTypeId: 2, // Microcredential Courses
    streamId: 0,
    microcredentialCourseId: 0,
    microcredentialModuleMasterId: 0,
    courseId: 0,
    courseDetailsId: 0,
    moduleMasterId: 0,
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
    // Attempts & Category (Category defaults to 1)
    attemptsAllowed: 1,
    attemptTry: 1,
    categoryId: 1,
    // Evaluation & Feedback
    deductPoints: false,
    deductionInPercentage: 0,
    autoPublishResults: true,
    syncToGradeBook: true,
  });

  // Coordinated mount & edit pre-fill initialization
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setLoadingInitial(true);
      let currentStreams = [];

      // Step 1: Ensure streams are available first
      try {
        const streamRes = await getStreamsDropdown();
        if (streamRes?.success && Array.isArray(streamRes.streamDataList)) {
          currentStreams = streamRes.streamDataList;
        } else if (streamRes?.streamList) {
          currentStreams = streamRes.streamList;
        }
        if (isMounted) setStreams(currentStreams);
      } catch (err) {
        console.warn("Failed to load streams in quiz init:", err);
      }

      // Step 2: In Edit Mode, load quiz details
      if (isEditMode) {
        let existingQuiz = null;

        if (modalQuiz) {
          existingQuiz = modalQuiz;
        } else {
          try {
            const detailRes = await getDegreeQuizDetailsByQuizId(quizIdParam);
            if (detailRes?.success && (detailRes.quizDetails || detailRes.quizMaster)) {
              existingQuiz = detailRes.quizDetails || detailRes.quizMaster;
            }
          } catch (dErr) {
            console.warn("getDegreeQuizDetailsByQuizId failed, using fallback:", dErr);
          }

          if (!existingQuiz && (location.state?.quiz || location.state?.item)) {
            existingQuiz = location.state?.quiz || location.state?.item;
          }

          if (!existingQuiz) {
            try {
              const res = await fetchPaginatedMicrocredentialQuizList({
                pageNo: 1,
                pageSize: 100,
                educationTypeId: 2,
              });
              const list = res?.quizDegreeList || res?.degreeQuizList || [];
              existingQuiz = list.find(
                (q) => Number(q.quizId || q.QuizId) === Number(quizIdParam)
              );
            } catch (err) {
              console.warn("Could not find quiz in list:", err);
            }
          }
        }

        if (isMounted && existingQuiz) {
          await applyQuizData(existingQuiz, currentStreams);
        }
      }

      if (isMounted) setLoadingInitial(false);
    }

    async function applyQuizData(q, streamsAvailable = []) {
      if (!q) return;

      let resolvedCourseId = Number(
        q.microcredentialCourseId ??
        q.MicrocredentialCourseId ??
        q.courseId ??
        q.CourseId ??
        q.courseDetailsId ??
        q.CourseDetailsId ??
        q.quizCourseId ??
        q.QuizCourseId ??
        q.courseMasterId ??
        q.CourseMasterId ??
        q.microCourseId ??
        q.MicroCourseId ??
        q.microcredentialCourseDetailId ??
        q.MicrocredentialCourseDetailId ??
        q.course_id ??
        q.Course_Id ??
        q.rawDetails?.microcredentialCourseId ??
        q.rawDetails?.MicrocredentialCourseId ??
        q.rawDetails?.courseId ??
        q.rawDetails?.CourseId ??
        q.rawDetails?.courseDetailsId ??
        q.rawDetails?.CourseDetailsId ??
        q.rawDetails?.courseMasterId ??
        q.rawDetails?.microCourseId ??
        0
      );

      const resolvedModuleId = Number(
        q.microcredentialModuleMasterId ??
        q.MicrocredentialModuleMasterId ??
        q.moduleMasterId ??
        q.ModuleMasterId ??
        q.moduleId ??
        q.ModuleId ??
        q.rawDetails?.microcredentialModuleMasterId ??
        q.rawDetails?.moduleMasterId ??
        0
      );

      const cName =
        q.microcredentialCourseName ||
        q.MicrocredentialCourseName ||
        q.courseName ||
        q.CourseName ||
        q.microcredentialName ||
        q.MicrocredentialName ||
        q.rawDetails?.microcredentialCourseName ||
        q.rawDetails?.courseName ||
        "";
      const mName = q.moduleName || q.ModuleName || q.rawDetails?.moduleName || "";
      const sName = q.streamName || q.StreamName || q.stream || q.rawDetails?.streamName || "";

      if (cName) setCachedCourseName(cName);
      if (mName) setCachedModuleName(mName);
      if (sName) setCachedStreamName(sName);

      const streamsPool = (Array.isArray(streamsAvailable) && streamsAvailable.length > 0)
        ? streamsAvailable
        : streams;

      let resolvedStreamId = Number(q.streamId ?? q.StreamId ?? q.rawDetails?.streamId ?? 0);

      // Match stream by name if streamId is 0
      if (!resolvedStreamId && sName && streamsPool.length > 0) {
        const matched = streamsPool.find(
          (s) => (s.streamName || s.name)?.trim().toLowerCase() === sName.trim().toLowerCase()
        );
        if (matched) resolvedStreamId = Number(matched.streamId || matched.id || 0);
      }

      let loadedCourses = [];

      // If streamId is still 0 but we have a courseId, search streams for this course
      if (!resolvedStreamId && resolvedCourseId > 0 && streamsPool.length > 0) {
        for (const s of streamsPool) {
          const sId = Number(s.streamId || s.id);
          if (!sId) continue;
          try {
            const cRes = await getMicrocredentialCoursesByStream(sId);
            const cList = cRes?.microcredentialCourseOutputList || cRes?.courses || [];
            if (cList.some((c) => Number(c.microcredentialCourseId || c.courseId || c.id) === resolvedCourseId)) {
              resolvedStreamId = sId;
              loadedCourses = cList;
              setCourses(cList);
              break;
            }
          } catch {}
        }
      }

      // Fetch courses for the resolved stream if not loaded yet
      if (resolvedStreamId > 0 && loadedCourses.length === 0) {
        try {
          const cRes = await getMicrocredentialCoursesByStream(resolvedStreamId);
          const cList = cRes?.microcredentialCourseOutputList || cRes?.courses || [];
          if (Array.isArray(cList) && cList.length > 0) {
            loadedCourses = cList;
            setCourses(cList);
          }
        } catch (err) {
          console.warn("Failed fetching courses for resolved stream:", err);
        }
      }

      // If courseId is 0 but we have course name, match against loaded courses
      if (!resolvedCourseId && cName && loadedCourses.length > 0) {
        const matchedCourse = loadedCourses.find(
          (c) => (c.microcredentialCourseName || c.courseName || c.name)?.trim().toLowerCase() === cName.trim().toLowerCase()
        );
        if (matchedCourse) {
          resolvedCourseId = Number(matchedCourse.microcredentialCourseId || matchedCourse.courseId || matchedCourse.id || 0);
        }
      }

      // If courseId is still 0, but we have a moduleId or moduleName, find which course owns this module
      if (!resolvedCourseId && (resolvedModuleId > 0 || mName) && loadedCourses.length > 0) {
        for (const c of loadedCourses) {
          const cId = Number(c.microcredentialCourseId || c.courseId || c.id || 0);
          if (!cId) continue;
          try {
            const modRes = await getMicrocredentialModuleByCourseId(cId);
            const mList = modRes?.microcredentialModuleList || modRes?.modules || [];
            const hasModule = mList.some(
              (m) =>
                (resolvedModuleId > 0 && Number(m.microcredentialModuleMasterId ?? m.moduleId ?? m.id) === resolvedModuleId) ||
                (mName && (m.moduleName || m.name)?.trim().toLowerCase() === mName.trim().toLowerCase())
            );
            if (hasModule) {
              resolvedCourseId = cId;
              setModules(mList);
              if (!cName) {
                const foundName = c.microcredentialCourseName || c.courseName || c.name || "";
                if (foundName) setCachedCourseName(foundName);
              }
              break;
            }
          } catch {}
        }
      }

      // Fetch modules for the resolved course if not loaded yet
      if (resolvedCourseId > 0 && modules.length === 0) {
        try {
          const modRes = await getMicrocredentialModuleByCourseId(resolvedCourseId);
          const mList = modRes?.microcredentialModuleList || modRes?.modules || [];
          if (Array.isArray(mList) && mList.length > 0) {
            setModules(mList);
          }
        } catch (err) {
          console.warn("Failed fetching modules for resolved course:", err);
        }
      }

      // Resolve Real Dates and Times with intelligent fallbacks
      const rawDueDate =
        q.dueDate ||
        q.DueDate ||
        q.rawDetails?.dueDate ||
        q.rawDetails?.DueDate ||
        "";

      const rawStartDate =
        q.startDate ||
        q.StartDate ||
        q.startDateTime ||
        q.StartDateTime ||
        q.quizStartDate ||
        q.QuizStartDate ||
        q.fromDate ||
        q.FromDate ||
        q.quizFromDate ||
        q.rawDetails?.startDate ||
        q.rawDetails?.StartDate ||
        q.rawDetails?.startDateTime ||
        q.rawDetails?.StartDateTime ||
        q.rawDetails?.quizStartDate ||
        q.rawDetails?.QuizStartDate ||
        q.rawDetails?.fromDate ||
        q.rawDetails?.FromDate ||
        rawDueDate ||
        "";

      const rawEndDate =
        q.endDate ||
        q.EndDate ||
        q.endDateTime ||
        q.EndDateTime ||
        q.quizEndDate ||
        q.QuizEndDate ||
        q.toDate ||
        q.ToDate ||
        q.quizToDate ||
        q.rawDetails?.endDate ||
        q.rawDetails?.EndDate ||
        q.rawDetails?.endDateTime ||
        q.rawDetails?.EndDateTime ||
        q.rawDetails?.quizEndDate ||
        q.rawDetails?.QuizEndDate ||
        q.rawDetails?.toDate ||
        q.rawDetails?.ToDate ||
        rawDueDate ||
        "";

      const rawStartTime =
        q.startTime ||
        q.StartTime ||
        q.quizStartTime ||
        q.QuizStartTime ||
        q.fromTime ||
        q.FromTime ||
        q.rawDetails?.startTime ||
        q.rawDetails?.StartTime ||
        (rawStartDate && rawStartDate.includes("T") ? rawStartDate.split("T")[1]?.substring(0, 5) : "") ||
        "10:00";

      const rawEndTime =
        q.endTime ||
        q.EndTime ||
        q.quizEndTime ||
        q.QuizEndTime ||
        q.toTime ||
        q.ToTime ||
        q.rawDetails?.endTime ||
        q.rawDetails?.EndTime ||
        (rawEndDate && rawEndDate.includes("T") ? rawEndDate.split("T")[1]?.substring(0, 5) : "") ||
        "18:00";

      const resolvedAttempts = Number(
        q.attemptsAllowed ??
        q.AttemptsAllowed ??
        q.noOfAttempts ??
        q.NoOfAttempts ??
        q.rawDetails?.attemptsAllowed ??
        q.rawDetails?.AttemptsAllowed ??
        q.rawDetails?.noOfAttempts ??
        q.rawDetails?.NoOfAttempts ??
        q.attemptsTry ??
        q.AttemptsTry ??
        q.rawDetails?.attemptsTry ??
        q.rawDetails?.AttemptsTry ??
        q.attempts ??
        q.Attempts ??
        q.totalAttempt ??
        q.TotalAttempt ??
        q.attemptLimit ??
        q.AttemptLimit ??
        q.rawDetails?.attempts ??
        q.rawDetails?.Attempts ??
        q.rawDetails?.totalAttempt ??
        q.rawDetails?.TotalAttempt ??
        q.attemptTry ??
        q.AttemptTry ??
        q.rawDetails?.attemptTry ??
        q.rawDetails?.AttemptTry ??
        1
      );

      const cleanStartDate = formatDateOnly(rawStartDate);
      const cleanEndDate = formatDateOnly(rawEndDate);
      const cleanDueDate = formatDateOnly(rawDueDate);
      const cleanStartTime = formatTimeOnly(rawStartTime);
      const cleanEndTime = formatTimeOnly(rawEndTime);

      setFormData({
        quizId: quizIdParam,
        educationTypeId: Number(q.educationTypeId || q.EducationTypeId || 2),
        streamId: resolvedStreamId,
        microcredentialCourseId: resolvedCourseId,
        microcredentialModuleMasterId: resolvedModuleId,
        courseId: resolvedCourseId,
        courseDetailsId: resolvedCourseId,
        quizCourseId: resolvedCourseId,
        moduleMasterId: resolvedModuleId,
        moduleId: resolvedModuleId,
        yearRange: q.yearRange || q.YearRange || "2026 - 2027",
        quizTitle: q.quizTitle || q.QuizTitle || "",
        gradeOutOf: Number(q.gradeOutOf ?? q.GradeOutOf ?? 10),
        gradeBook: q.gradeBook || q.GradeBook || "In Grade Book",
        dueDate: cleanDueDate,
        quizDescription: q.quizDescription || q.QuizDescription || "",
        hasTimeLimit: Boolean(q.hasTimeLimit ?? q.HasTimeLimit ?? true),
        timeLimitMinutes: q.timeLimitMinutes ?? q.TimeLimitMinutes ?? 120,
        questionsPerPageId: q.questionsPerPageId ?? q.QuestionsPerPageId ?? 1,
        preventPreviousBackNavigation: Boolean(
          q.preventPreviousBackNavigation ?? q.PreventPreviousBackNavigation ?? true
        ),
        shuffleQuestionsAndSections: Boolean(
          q.shuffleQuestionsAndSections ?? q.ShuffleQuestionsAndSections ?? false
        ),
        allowHints: Boolean(q.allowHints ?? q.AllowHints ?? true),
        disableInternalMessages: Boolean(q.disableInternalMessages ?? q.DisableInternalMessages ?? false),
        headerDescription: q.headerDescription || q.HeaderDescription || "",
        footerDescription: q.footerDescription || q.FooterDescription || "",
        startDate: cleanStartDate,
        startTime: cleanStartTime,
        endDate: cleanEndDate,
        endTime: cleanEndTime,
        password: q.password || q.Password || "",
        attemptsAllowed: resolvedAttempts,
        attemptTry: resolvedAttempts,
        categoryId: q.categoryId ?? q.CategoryId ?? 1,
        deductPoints: Boolean(q.deductPoints ?? q.DeductPoints ?? false),
        deductionInPercentage: q.deductionInPercentage ?? q.DeductionInPercentage ?? 0,
        autoPublishResults: Boolean(q.autoPublishResults ?? q.AutoPublishResults ?? true),
        syncToGradeBook: Boolean(q.syncToGradeBook ?? q.SyncToGradeBook ?? true),
      });
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, quizIdParam, modalQuiz]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStreamChange = async (e) => {
    const sId = Number(e.target.value);
    const selectedObj = streams.find(
      (s) => Number(s.streamId || s.id) === sId
    );
    const sName = selectedObj?.streamName || selectedObj?.name || "";
    if (sName) setCachedStreamName(sName);

    setFormData((prev) => ({
      ...prev,
      streamId: sId,
      microcredentialCourseId: 0,
      courseId: 0,
      courseDetailsId: 0,
      quizCourseId: 0,
      microcredentialModuleMasterId: 0,
      moduleMasterId: 0,
      moduleId: 0,
    }));
    setCourses([]);
    setModules([]);
    setCachedCourseName("");
    setCachedModuleName("");

    if (sId > 0) {
      setLoadingCourses(true);
      try {
        const res = await getMicrocredentialCoursesByStream(sId);
        const list = res?.microcredentialCourseOutputList || res?.courses || [];
        setCourses(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn("Error fetching courses for stream:", err);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    }
  };

  const handleCourseChange = async (e) => {
    const cId = Number(e.target.value);
    const selectedObj = courses.find(
      (c) => Number(c.microcredentialCourseId || c.courseId) === cId
    );
    const cName = selectedObj?.microcredentialCourseName || selectedObj?.courseName || "";
    if (cName) setCachedCourseName(cName);

    setFormData((prev) => ({
      ...prev,
      microcredentialCourseId: cId,
      courseId: cId,
      courseDetailsId: cId,
      quizCourseId: cId,
      microcredentialModuleMasterId: 0,
      moduleMasterId: 0,
      moduleId: 0,
    }));
    setModules([]);
    setCachedModuleName("");

    if (cId > 0) {
      setLoadingModules(true);
      try {
        const res = await getMicrocredentialModuleByCourseId(cId);
        const list = res?.microcredentialModuleList || res?.modules || [];
        setModules(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn("Error fetching modules for course:", err);
        setModules([]);
      } finally {
        setLoadingModules(false);
      }
    }
  };

  const handleModuleChange = (e) => {
    const mId = Number(e.target.value);
    const selectedObj = modules.find(
      (m) => Number(m.microcredentialModuleMasterId ?? m.moduleId) === mId
    );
    if (selectedObj?.moduleName) setCachedModuleName(selectedObj.moduleName);
    setFormData((prev) => ({
      ...prev,
      microcredentialModuleMasterId: mId,
      moduleMasterId: mId,
      moduleId: mId,
    }));
  };

  const handleSubmit = async (e, actionType = "continue") => {
    if (e && e.preventDefault) e.preventDefault();

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
      const resolvedCourseId = Number(
        formData.microcredentialCourseId || formData.courseId || 0
      );
      const resolvedModuleId = Number(
        formData.microcredentialModuleMasterId || formData.moduleMasterId || 0
      );
      const resolvedStreamId = Number(formData.streamId || 0);

      const payload = {
        ...formData,
        quizId: Number(formData.quizId || 0),
        QuizId: Number(formData.quizId || 0),
        streamId: resolvedStreamId,
        StreamId: resolvedStreamId,
        courseId: resolvedCourseId,
        CourseId: resolvedCourseId,
        courseDetailsId: resolvedCourseId,
        CourseDetailsId: resolvedCourseId,
        microcredentialCourseId: resolvedCourseId,
        MicrocredentialCourseId: resolvedCourseId,
        quizCourseId: resolvedCourseId,
        QuizCourseId: resolvedCourseId,
        moduleMasterId: resolvedModuleId,
        ModuleMasterId: resolvedModuleId,
        microcredentialModuleMasterId: resolvedModuleId,
        MicrocredentialModuleMasterId: resolvedModuleId,
        moduleId: resolvedModuleId,
        ModuleId: resolvedModuleId,
        categoryId: 1,
        CategoryId: 1,
        yearRange: formData.yearRange || "2026 - 2027",
        gradeOutOf: Number(formData.gradeOutOf) || 10,
        gradeBook: formData.gradeBook || "In Grade Book",
        dueDate: formatDateOnly(formData.dueDate || formData.endDate),
        DueDate: formatDateOnly(formData.dueDate || formData.endDate),
        startDate: formatDateOnly(formData.startDate || formData.dueDate),
        StartDate: formatDateOnly(formData.startDate || formData.dueDate),
        endDate: formatDateOnly(formData.endDate || formData.dueDate),
        EndDate: formatDateOnly(formData.endDate || formData.dueDate),
        startTime: formatTimeOnly(formData.startTime) || "10:00",
        StartTime: formatTimeOnly(formData.startTime) || "10:00",
        endTime: formatTimeOnly(formData.endTime) || "18:00",
        EndTime: formatTimeOnly(formData.endTime) || "18:00",
        password: formData.password || "",
        attemptsAllowed: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        AttemptsAllowed: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        attemptTry: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        AttemptTry: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        attemptsTry: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        AttemptsTry: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        noOfAttempts: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        NoOfAttempts: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        totalAttempt: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        TotalAttempt: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        attempts: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
        Attempts: Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1),
      };

      // Step 1: Save Quiz Master (Only saves basic detail)
      const masterRes = await saveDegreeQuizMaster(payload);
      if (!masterRes || masterRes.success === false) {
        setErrorMessage(masterRes?.message || "Failed to save Quiz Master.");
        setSaving(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const assignedQuizId = Number(
        masterRes.quizId ||
        masterRes.QuizId ||
        masterRes.id ||
        formData.quizId ||
        quizIdParam
      );

      if (modalMode) {
        setSuccessMessage("Quiz saved successfully.");
        if (onModalSaved) onModalSaved({ quizId: assignedQuizId, ...payload });
        if (onModalClose) onModalClose();
        return;
      }

      if (actionType === "close") {
        navigate("/microcredential/quiz", {
          state: {
            successMessage: isEditMode
              ? "Quiz updated successfully."
              : "Quiz created successfully.",
          },
        });
        return;
      }

      // Redirect to full-page Quiz Questions Manager
      navigate(`/microcredential/quiz-questions/${assignedQuizId}`, {
        state: {
          quizTitle: formData.quizTitle,
          fromAdd: !isEditMode,
          successMessage: isEditMode
            ? "Quiz updated successfully."
            : "Quiz created successfully.",
        },
      });
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

        <div className="flex items-center gap-2.5">
          {(formData.quizId > 0 || isEditMode) && (
            <Link
              to={`/microcredential/quiz-questions/${quizIdParam || formData.quizId}`}
              state={{
                quizTitle: formData.quizTitle,
                moduleName: cachedModuleName,
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-xs hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition cursor-pointer"
            >
              <span>📝</span>
              <span>Manage Questions</span>
            </Link>
          )}

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
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
            1. Quiz Details, Course & Module Association
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Select the stream, microcredential course, and specific module for this quiz.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                value={Number(formData.microcredentialCourseId || formData.courseId || 0)}
                onChange={handleCourseChange}
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
                {courses.map((c) => {
                  const cId = Number(c.microcredentialCourseId ?? c.courseId ?? c.id ?? 0);
                  const cTitle = c.microcredentialCourseName || c.courseName || c.name || `Course #${cId}`;
                  return (
                    <option key={cId} value={cId}>
                      {cTitle}
                    </option>
                  );
                })}
                {(Number(formData.microcredentialCourseId) > 0 || Number(formData.courseId) > 0) &&
                  !courses.some(
                    (c) => Number(c.microcredentialCourseId ?? c.courseId ?? c.id) === Number(formData.microcredentialCourseId || formData.courseId)
                  ) && (
                    <option value={Number(formData.microcredentialCourseId || formData.courseId)}>
                      {cachedCourseName || `Course #${formData.microcredentialCourseId || formData.courseId}`}
                    </option>
                  )}
              </select>
            </div>

            {/* Microcredential Module */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Microcredential Module <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.microcredentialModuleMasterId || formData.moduleMasterId || 0}
                onChange={handleModuleChange}
                disabled={loadingModules}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60"
              >
                <option value={0}>
                  {loadingModules
                    ? "Loading modules..."
                    : formData.microcredentialCourseId
                    ? "-- Select Module --"
                    : "-- Select Course First --"}
                </option>
                {modules.map((m) => {
                  const mId = Number(m.microcredentialModuleMasterId ?? m.moduleId ?? 0);
                  const mTitle = m.moduleName || m.name || `Module #${mId}`;
                  return (
                    <option key={mId} value={mId}>
                      {mTitle}
                    </option>
                  );
                })}
                {(formData.microcredentialModuleMasterId > 0 || formData.moduleMasterId > 0) &&
                  !modules.some(
                    (m) =>
                      Number(m.microcredentialModuleMasterId ?? m.moduleId) ===
                      Number(formData.microcredentialModuleMasterId || formData.moduleMasterId)
                  ) && (
                    <option value={formData.microcredentialModuleMasterId || formData.moduleMasterId}>
                      {cachedModuleName || `Module #${formData.microcredentialModuleMasterId || formData.moduleMasterId}`}
                    </option>
                  )}
              </select>
            </div>
          </div>

          {/* Quiz Title */}
          <div className="mt-5">
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

        {/* Section 2: Timing, Display & Pacing Controls */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            2. Timing, Display & Pacing Controls
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Configure examination time limits, questions distribution per page, and navigation restrictions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
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
              <ThemedDatePicker
                value={formData.startDate}
                placeholder="YYYY-MM-DD"
                onChange={(dateStr) => handleChange("startDate", dateStr)}
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <ThemedTimePicker
                value={formData.startTime}
                placeholder="hh:mm AM/PM"
                onChange={(timeStr) => handleChange("startTime", timeStr)}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <ThemedDatePicker
                value={formData.endDate}
                placeholder="YYYY-MM-DD"
                onChange={(dateStr) => handleChange("endDate", dateStr)}
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <ThemedTimePicker
                value={formData.endTime}
                placeholder="hh:mm AM/PM"
                onChange={(timeStr) => handleChange("endTime", timeStr)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {/* Attempts Allowed (1 to 10) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Attempts Allowed
              </label>
              <select
                value={Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const cleanVal = isNaN(val) ? 1 : val;
                  setFormData((prev) => ({
                    ...prev,
                    attemptsAllowed: cleanVal,
                    AttemptsAllowed: cleanVal,
                    attemptTry: cleanVal,
                    AttemptTry: cleanVal,
                    noOfAttempts: cleanVal,
                    NoOfAttempts: cleanVal,
                  }));
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value={0}>Unlimited Attempts</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Attempt Only" : "Attempts"}
                  </option>
                ))}
                {Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1) > 10 && (
                  <option value={Number(formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry ?? 1)}>
                    {formData.attemptsAllowed ?? formData.AttemptsAllowed ?? formData.attemptTry} Attempts
                  </option>
                )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {isEditMode ? (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, "close")}
                className="px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-100 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving..." : "Update Quiz"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, "continue")}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Update & Manage Questions ➔</span>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, "close")}
                className="px-5 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-100 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Quiz"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, "continue")}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save & Add Questions ➔</span>
                )}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Question Master Modal */}
      {isQuestionModalOpen && (
        <QuestionMasterModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          quiz={{
            quizId: formData.quizId,
            quizTitle: formData.quizTitle,
          }}
        />
      )}
    </div>
  );
}
