import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  CheckCircleIcon,
  AlertIcon,
  CloseIcon,
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
  getMicrocredentialQuizCategoryList,
  buildDegreeQuizMasterAddUpdateInput,
  buildFinalizeDegreeQuizAddUpdateInput,
} from "../../services/AdminQuizPageService";
import QuestionMasterModal from "./QuestionMasterModal";

/**
 * Normalizes date to clean YYYY-MM-DD string
 */
export function formatDateOnly(val) {
  if (!val) return "";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, "0");
    const dd = String(val.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const str = String(val).trim();
  if (!str) return "";
  if (str.includes("T")) {
    return str.split("T")[0];
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  const dmyMatch = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (dmyMatch) {
    const months = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
    };
    const dd = String(dmyMatch[1]).padStart(2, "0");
    const mm = months[dmyMatch[2].toLowerCase()] || "01";
    const yyyy = dmyMatch[3];
    return `${yyyy}-${mm}-${dd}`;
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
 * Safely parses any date string (ISO, dd-MMM-yyyy, or 'today') into a valid Date object
 */
export function parseDateSafe(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  const str = String(val).trim();
  if (!str) return null;
  if (str.toLowerCase() === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  }
  const dmyMatch = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (dmyMatch) {
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const d = parseInt(dmyMatch[1], 10);
    const m = months[dmyMatch[2].toLowerCase()] ?? 0;
    const y = parseInt(dmyMatch[3], 10);
    return new Date(y, m, d);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats date into readable dd-MMM-yyyy (e.g., 26-Sep-2026)
 */
export function formatDisplayDate(val) {
  if (!val) return "";
  const clean = formatDateOnly(val);
  if (!clean) return "";
  const parts = clean.split("-");
  if (parts.length === 3) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const mIdx = parseInt(parts[1], 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${parts[2]}-${months[mIdx]}-${parts[0]}`;
    }
  }
  return clean;
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
 * Reusable Date Picker Component based on Flatpickr (dd-MMM-yyyy)
 */
function ThemedDatePicker({
  value,
  onChange,
  placeholder = "dd-----yyyy",
  disabled = false,
  minDate = "today",
}) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);
  const cleanDate = formatDateOnly(value);
  const displayVal = formatDisplayDate(cleanDate);

  useEffect(() => {
    if (!inputRef.current) return;
    const initialDate = parseDateSafe(cleanDate);
    const initialMinDate = parseDateSafe(minDate);

    fpRef.current = flatpickr(inputRef.current, {
      dateFormat: "d-M-Y",
      static: false,
      position: "auto left",
      appendTo: document.body,
      minDate: initialMinDate || undefined,
      monthSelectorType: "static",
      defaultDate: initialDate || undefined,
      clickOpens: true,
      parseDate: (dateStr) => parseDateSafe(dateStr) || undefined,
      formatDate: (dateObj) => {
        const d = String(dateObj.getDate()).padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const m = months[dateObj.getMonth()];
        const y = dateObj.getFullYear();
        return `${d}-${m}-${y}`;
      },
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onChange: (selectedDates) => {
        if (selectedDates && selectedDates[0]) {
          const d = selectedDates[0];
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const formatted = `${yyyy}-${mm}-${dd}`;
          if (onChange) onChange(formatted);
        } else if (onChange) {
          onChange("");
        }
      },
    });

    return () => {
      if (fpRef.current && !Array.isArray(fpRef.current)) {
        fpRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (fpRef.current) {
      if (!cleanDate) {
        fpRef.current.clear();
      } else {
        const parsed = parseDateSafe(cleanDate);
        if (parsed) {
          const curr = fpRef.current.selectedDates[0];
          const currStr = curr
            ? `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}-${String(curr.getDate()).padStart(2, "0")}`
            : "";
          if (currStr !== cleanDate) {
            fpRef.current.setDate(parsed, false);
          }
        }
      }
    }
  }, [cleanDate]);

  useEffect(() => {
    if (fpRef.current && minDate !== undefined) {
      const parsedMin = parseDateSafe(minDate);
      fpRef.current.set("minDate", parsedMin || null);
    }
  }, [minDate]);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        defaultValue={displayVal}
        className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-10 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <CalenderIcon className="size-4" />
      </span>
    </div>
  );
}

/**
 * Reusable Time Picker Component based on Flatpickr (12-hour AM/PM)
 */
function ThemedTimePicker({
  value,
  onChange,
  placeholder = "--:-- --",
  disabled = false,
}) {
  const inputRef = useRef(null);
  const fpRef = useRef(null);
  const cleanTime = formatTimeOnly(value);

  useEffect(() => {
    if (!inputRef.current) return;
    fpRef.current = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: "h:i K",
      time_24hr: false,
      defaultDate: cleanTime || undefined,
      clickOpens: true,
      static: false,
      position: "auto left",
      appendTo: document.body,
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
    <div className="relative w-full">
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

  // Stepper state: 1 = New Quiz form, 2 = Accordions (Settings & Conditions)
  const [currentStep, setCurrentStep] = useState(1);

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
  const [categoriesList, setCategoriesList] = useState([]);

  // Cached display names for smooth pre-fill in edit mode
  const [cachedCourseName, setCachedCourseName] = useState("");
  const [cachedModuleName, setCachedModuleName] = useState("");
  const [cachedStreamName, setCachedStreamName] = useState("");

  // Accordion state (Image 1 starts with all collapsed or customizable)
  const [openAccordions, setOpenAccordions] = useState({
    availability: false,
    timing: false,
    attempts: false,
    evaluation: false,
  });

  const toggleAccordion = (sectionKey) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Modals for "Manage" buttons
  const [activeModal, setActiveModal] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    quizId: isEditMode ? quizIdParam : 0,
    educationTypeId: 2, // 2 = Microcredential Courses
    streamId: 0,
    microcredentialCourseId: 0,
    microcredentialModuleMasterId: 0,
    courseId: 0,
    courseDetailsId: 0,
    moduleMasterId: 0,
    yearRange: "2026 - 2027",
    quizTitle: "",
    gradeOutOf: 0,
    totalQuestionsGradeOutOf: 0,
    gradeBook: "Not in Grade Book",
    dueDate: "",
    quizDescription: "",
    // Timing & Display
    hasTimeLimit: false,
    timeLimitMinutes: 120,
    isAsynchronous: true,
    isSynchronous: false,
    timeLimitExpiryActionId: "autoSubmit",
    questionsPerPageId: 0, // 0 = All questions displayed together
    preventPreviousBackNavigation: true,
    shuffleQuestionsAndSections: false,
    allowHints: false,
    disableInternalMessages: false,
    headerDescription: "",
    footerDescription: "",
    // Availability
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    password: "",
    allowSelectedUsersAccess: true,
    allowOnlySpecialAccessUsers: false,
    specialAccessNotes: "",
    ipRestrictions: "",
    // Attempts & Category
    attemptsAllowed: 1,
    attemptTry: 1,
    overallGradeCalculationId: 1, // 1 = Highest
    categoryId: 0,
    notificationEmail: "",
    autoCompletionTypeId: "1", // Complete after attempt is submitted
    // Evaluation & Feedback
    deductPoints: false,
    deductionInPercentage: 0,
    autoPublishResults: true,
    syncToGradeBook: false,
    passingGradePercentage: 60,
  });

  // Load Quiz Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getMicrocredentialQuizCategoryList();
        if (res?.success && Array.isArray(res.microcredentialQuizCategoryList)) {
          setCategoriesList(res.microcredentialQuizCategoryList);
        }
      } catch (e) {
        console.warn("Failed loading quiz categories:", e);
      }
    }
    loadCategories();
  }, []);

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
              const listRes = await fetchPaginatedMicrocredentialQuizList({
                pageNo: 1,
                pageSize: 50,
              });
              const pool = listRes?.microcredentialQuizList || listRes?.quizList || [];
              existingQuiz = pool.find(
                (item) => Number(item.quizId || item.QuizId || item.id) === quizIdParam
              );
            } catch {}
          }
        }

        if (existingQuiz && isMounted) {
          await populateFormFromQuiz(existingQuiz, currentStreams);
        }
      }
      if (isMounted) setLoadingInitial(false);
    }

    async function populateFormFromQuiz(q, streamsAvailable) {
      let resolvedCourseId = Number(
        q.microcredentialCourseId ||
        q.courseId ||
        q.courseDetailsId ||
        q.quizCourseId ||
        q.CourseDetailsId ||
        q.CourseId ||
        q.MicrocredentialCourseId ||
        q.QuizCourseId ||
        q.rawDetails?.courseDetailsId ||
        q.rawDetails?.courseId ||
        0
      );

      let resolvedModuleId = Number(
        q.microcredentialModuleMasterId ||
        q.moduleMasterId ||
        q.moduleId ||
        q.ModuleMasterId ||
        q.MicrocredentialModuleMasterId ||
        q.ModuleId ||
        q.rawDetails?.moduleMasterId ||
        q.rawDetails?.moduleId ||
        0
      );

      const cName =
        q.microcredentialCourseName ||
        q.courseName ||
        q.name ||
        q.CourseName ||
        q.rawDetails?.courseName ||
        location.state?.courseName ||
        "";

      const mName =
        q.moduleName ||
        q.ModuleName ||
        q.rawDetails?.moduleName ||
        location.state?.moduleName ||
        "";

      const sName =
        q.streamName ||
        q.stream ||
        q.Stream ||
        q.rawDetails?.streamName ||
        location.state?.streamName ||
        "";

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

      // Resolve Dates and Times without cross-fallback
      const rawDueDate =
        q.dueDate ||
        q.DueDate ||
        q.rawDetails?.dueDate ||
        q.rawDetails?.DueDate ||
        q.rawDetails?.quizBasicInfo?.dueDate ||
        q.rawDetails?.quizBasicInfo?.DueDate ||
        "";

      const rawStartDate =
        q.startDate ||
        q.StartDate ||
        q.startDateTime ||
        q.StartDateTime ||
        q.rawDetails?.startDate ||
        q.rawDetails?.StartDate ||
        "";

      const rawEndDate =
        q.endDate ||
        q.EndDate ||
        q.endDateTime ||
        q.EndDateTime ||
        q.rawDetails?.endDate ||
        q.rawDetails?.EndDate ||
        "";

      const rawStartTime =
        q.startTime ||
        q.StartTime ||
        q.rawDetails?.startTime ||
        q.rawDetails?.StartTime ||
        (rawStartDate && rawStartDate.includes("T") ? rawStartDate.split("T")[1]?.substring(0, 5) : "") ||
        "";

      const rawEndTime =
        q.endTime ||
        q.EndTime ||
        q.rawDetails?.endTime ||
        q.rawDetails?.EndTime ||
        (rawEndDate && rawEndDate.includes("T") ? rawEndDate.split("T")[1]?.substring(0, 5) : "") ||
        "";

      const rawAttempts =
        q.attemptsAllowed ??
        q.AttemptsAllowed ??
        q.noOfAttempts ??
        q.NoOfAttempts ??
        q.attemptTry ??
        q.AttemptTry;
      const resolvedAttempts = (rawAttempts !== undefined && rawAttempts !== null && rawAttempts !== '' && Number(rawAttempts) > 0)
        ? Number(rawAttempts)
        : 1;

      const isSync = Boolean(q.isSynchronous ?? q.IsSynchronous ?? false);
      const isAsync = !isSync;

      const resolvedGradeBook = q.gradeBook || q.GradeBook || "Not in Grade Book";
      const resolvedSyncToGradeBook = resolvedGradeBook === "In Grade Book"
        ? true
        : Boolean(q.syncToGradeBook ?? q.SyncToGradeBook ?? false);

      const rawPassGrade = q.passingGradePercentage ?? q.PassingGradePercentage;
      const resolvedPassingGrade = (rawPassGrade !== undefined && rawPassGrade !== null && rawPassGrade !== '' && Number(rawPassGrade) > 0)
        ? Number(rawPassGrade)
        : 60;

      const resolvedPreventBackNav = Boolean(
        q.preventPreviousBackNavigation ?? q.PreventPreviousBackNavigation ?? true
      );

      const resolvedGradeOutOf = Number(q.gradeOutOf ?? q.GradeOutOf ?? 0);
      const rawTotalQ = q.totalQuestionsGradeOutOf ?? q.TotalQuestionsGradeOutOf;
      const resolvedTotalQGrade = (rawTotalQ !== undefined && rawTotalQ !== null && rawTotalQ !== '' && Number(rawTotalQ) > 0)
        ? Number(rawTotalQ)
        : resolvedGradeOutOf;

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
        gradeOutOf: resolvedGradeOutOf,
        totalQuestionsGradeOutOf: resolvedTotalQGrade,
        gradeBook: resolvedGradeBook,
        dueDate: cleanDueDate,
        quizDescription: q.quizDescription || q.QuizDescription || "",
        hasTimeLimit: Boolean(q.hasTimeLimit ?? q.HasTimeLimit ?? false),
        timeLimitMinutes: Number(q.timeLimitMinutes ?? q.TimeLimitMinutes ?? 120),
        isAsynchronous: isAsync,
        isSynchronous: isSync,
        timeLimitExpiryActionId: q.timeLimitExpiryActionId || q.TimeLimitExpiryActionId || "autoSubmit",
        questionsPerPageId: Number(q.questionsPerPageId ?? q.QuestionsPerPageId ?? 0),
        preventPreviousBackNavigation: resolvedPreventBackNav,
        shuffleQuestionsAndSections: Boolean(
          q.shuffleQuestionsAndSections ?? q.ShuffleQuestionsAndSections ?? false
        ),
        allowHints: Boolean(q.allowHints ?? q.AllowHints ?? false),
        disableInternalMessages: Boolean(
          q.disableInternalMessages ?? q.DisableInternalMessages ?? false
        ),
        headerDescription: q.headerDescription || q.HeaderDescription || "",
        footerDescription: q.footerDescription || q.FooterDescription || "",
        startDate: cleanStartDate,
        startTime: cleanStartTime,
        endDate: cleanEndDate,
        endTime: cleanEndTime,
        password: q.password || q.Password || "",
        allowSelectedUsersAccess: Boolean(
          q.allowSelectedUsersAccess ?? q.AllowSelectedUsersAccess ?? true
        ),
        allowOnlySpecialAccessUsers: Boolean(
          q.allowOnlySpecialAccessUsers ?? q.AllowOnlySpecialAccessUsers ?? false
        ),
        specialAccessNotes: q.specialAccessNotes || "",
        ipRestrictions: q.ipRestrictions || "",
        attemptsAllowed: resolvedAttempts,
        attemptTry: resolvedAttempts,
        overallGradeCalculationId: Number(
          q.overallGradeCalculationId ?? q.OverallGradeCalculationId ?? 1
        ),
        categoryId: Number(q.categoryId ?? q.CategoryId ?? 0),
        notificationEmail: q.notificationEmail || q.NotificationEmail || "",
        autoCompletionTypeId: String(
          q.autoCompletionTypeId ?? q.AutoCompletionTypeId ?? "1"
        ),
        deductPoints: Boolean(q.deductPoints ?? q.DeductPoints ?? false),
        deductionInPercentage: Number(q.deductionInPercentage ?? q.DeductionInPercentage ?? 0),
        autoPublishResults: Boolean(q.autoPublishResults ?? q.AutoPublishResults ?? true),
        syncToGradeBook: resolvedSyncToGradeBook,
        passingGradePercentage: resolvedPassingGrade,
      });
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, quizIdParam, modalQuiz]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "gradeBook") {
        if (value === "In Grade Book") {
          next.syncToGradeBook = true;
        } else if (value === "Not in Grade Book") {
          next.syncToGradeBook = false;
        }
      }
      return next;
    });
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
      (m) => Number(m.microcredentialModuleMasterId ?? m.moduleId ?? m.id) === mId
    );
    const mName = selectedObj?.moduleName || selectedObj?.name || "";
    if (mName) setCachedModuleName(mName);

    setFormData((prev) => ({
      ...prev,
      microcredentialModuleMasterId: mId,
      moduleMasterId: mId,
      moduleId: mId,
    }));
  };

  /**
   * Action from Step 1 -> Move to Step 2
   */
  const handleNextStep1 = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.quizTitle.trim()) {
      setErrorMessage("Please enter a Quiz Title.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.streamId) {
      setErrorMessage("Please select a Stream.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!formData.microcredentialCourseId) {
      setErrorMessage("Please select a Microcredential Course.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Validate Start Date is today or in the future
    if (formData.startDate) {
      const cleanStart = formatDateOnly(formData.startDate);
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (cleanStart && cleanStart < todayStr && !isEditMode) {
        setErrorMessage("Start Date must be today or a future date. Past dates cannot be added.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const masterDto = buildDegreeQuizMasterAddUpdateInput(formData);
      console.log("MASTER REQUEST", JSON.stringify(masterDto.payload, null, 2));
      const masterRes = await saveDegreeQuizMaster(masterDto);
      console.log("MASTER RESPONSE", JSON.stringify(masterRes, null, 2));
      if (!masterRes || masterRes.success === false) {
        setErrorMessage(masterRes?.message || "Failed to save Quiz Master.");
        setSaving(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const assignedQuizId = Number(
        (isEditMode ? formData.quizId : (masterRes.quizId || formData.quizId)) ||
        quizIdParam ||
        0
      );

      setFormData((prev) => ({
        ...prev,
        quizId: assignedQuizId,
      }));

      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.warn("Save master error, moving to step 2 with current state:", err);
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
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

    // Validate Start Date is today or in the future
    if (formData.startDate) {
      const cleanStart = formatDateOnly(formData.startDate);
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (cleanStart && cleanStart < todayStr && !isEditMode) {
        setErrorMessage("Start Date must be today or a future date. Past dates cannot be added.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    // Validate End Date is not before Start Date
    if (formData.startDate && formData.endDate) {
      const cleanStart = formatDateOnly(formData.startDate);
      const cleanEnd = formatDateOnly(formData.endDate);
      if (cleanEnd && cleanEnd < cleanStart) {
        setErrorMessage("End Date cannot be earlier than Start Date.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Step 2: Create Master API DTO
      const masterDto = buildDegreeQuizMasterAddUpdateInput(formData);
      console.log("MASTER REQUEST", JSON.stringify(masterDto.payload, null, 2));

      // Step 3: Call Master API
      const masterRes = await saveDegreeQuizMaster(masterDto);
      console.log("MASTER RESPONSE", JSON.stringify(masterRes, null, 2));
      if (!masterRes || masterRes.success === false) {
        setErrorMessage(masterRes?.message || "Failed to save Quiz Master.");
        setSaving(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Step 4: Read returned QuizId (For Edit: existing ID; For Add: newly generated ID)
      const assignedQuizId = Number(
        (isEditMode ? formData.quizId : (masterRes.quizId || formData.quizId)) ||
        quizIdParam ||
        0
      );

      // Step 5: Update local form state with resolved QuizId
      setFormData((prev) => ({
        ...prev,
        quizId: assignedQuizId,
      }));

      // Step 6: Build Finalize DTO using the SAME resolved QuizId
      const finalizeDto = buildFinalizeDegreeQuizAddUpdateInput({
        ...formData,
        quizId: assignedQuizId,
        QuizId: assignedQuizId,
      });
      console.log("FINALIZE REQUEST", JSON.stringify(finalizeDto.payload, null, 2));

      // Step 7: Call Finalize API
      try {
        const finalizeRes = await finalizeDegreeQuiz(finalizeDto);
        console.log("FINALIZE RESPONSE", JSON.stringify(finalizeRes, null, 2));
      } catch (fErr) {
        console.warn("Finalize settings notice:", fErr);
      }

      if (modalMode) {
        setSuccessMessage("Quiz saved successfully.");
        if (onModalSaved) onModalSaved({ quizId: assignedQuizId, ...formData });
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

      // Step 8: Next Page -> Redirect to Quiz Questions Manager with complete quiz metadata
      const resolvedStreamId = Number(formData.streamId || 0);
      const resolvedCourseId = Number(formData.microcredentialCourseId || 0);
      const resolvedModuleId = Number(formData.microcredentialModuleMasterId || 0);

      const resolvedStreamName =
        cachedStreamName ||
        streams.find((s) => Number(s.streamId || s.id) === resolvedStreamId)?.streamName ||
        "";
      const resolvedCourseName =
        cachedCourseName ||
        courses.find((c) => Number(c.microcredentialCourseId || c.courseId) === resolvedCourseId)?.microcredentialCourseName ||
        "";
      const resolvedModuleName =
        cachedModuleName ||
        modules.find((m) => Number(m.microcredentialModuleMasterId || m.moduleId) === resolvedModuleId)?.moduleName ||
        "";

      navigate(`/microcredential/quiz-questions/${assignedQuizId}`, {
        state: {
          quizId: assignedQuizId,
          quizTitle: formData.quizTitle,
          streamId: resolvedStreamId,
          streamName: resolvedStreamName,
          courseId: resolvedCourseId,
          courseName: resolvedCourseName,
          moduleId: resolvedModuleId,
          moduleName: resolvedModuleName,
          yearRange: formData.yearRange,
          gradeOutOf: formData.gradeOutOf,
          gradeBook: formData.gradeBook,
          startDate: formData.startDate,
          endDate: formData.endDate,
          hasTimeLimit: formData.hasTimeLimit,
          timeLimitMinutes: formData.timeLimitMinutes,
          attemptsAllowed: formData.attemptsAllowed,
          fromAdd: !isEditMode,
          successMessage: isEditMode
            ? "Quiz updated successfully. Now configure questions."
            : "Quiz created successfully. Now configure questions.",
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

      {/* Stepper Header (Image 1 top: Circle 1 ------ Circle 2) */}
      <div className="mb-8 flex items-center justify-between w-full px-2">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentStep(1)}
        >
          <div
            className={`flex items-center justify-center size-8 rounded-full font-bold text-xs shadow-xs transition ${
              currentStep === 1
                ? "border-2 border-red-600 bg-white text-red-600"
                : "border-2 border-red-600 bg-red-600 text-white"
            }`}
          >
            {currentStep > 1 ? "✓" : "1"}
          </div>
        </div>
        <div
          className={`flex-1 h-[2px] mx-4 transition-colors ${
            currentStep === 2 ? "bg-red-600" : "bg-red-100 dark:bg-gray-700"
          }`}
        ></div>
        <div
          className={`flex items-center gap-2 ${
            formData.quizTitle.trim() && formData.streamId ? "cursor-pointer" : "cursor-default"
          }`}
          onClick={() => {
            if (formData.quizTitle.trim() && formData.streamId) {
              setCurrentStep(2);
            }
          }}
        >
          <div
            className={`flex items-center justify-center size-8 rounded-full font-bold text-xs shadow-xs transition ${
              currentStep === 2
                ? "border-2 border-red-600 bg-white text-red-600"
                : "border border-gray-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* STEP 1: Main Quiz Card (Image 1)                                */}
      {/* ================================================================ */}
      {currentStep === 1 && (
        <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-visible">
          {/* Card Header: "New Quiz" */}
          <div className="bg-gray-50/70 dark:bg-gray-800/60 px-6 py-4 border-b border-gray-100 dark:border-gray-800 rounded-t-2xl">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Quiz" : "New Quiz"}
              </h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Row 1: Stream*, Microcredential Course*, Microcredential Module* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stream* */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Stream <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.streamId}
                    onChange={handleStreamChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                  >
                    <option value={0}>-- Select Stream --</option>
                    {streams.map((s) => (
                      <option key={s.streamId || s.id} value={s.streamId || s.id}>
                        {s.streamName || s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Microcredential Course* */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Microcredential Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={Number(formData.microcredentialCourseId || formData.courseId || 0)}
                    onChange={handleCourseChange}
                    disabled={loadingCourses}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60 cursor-pointer"
                  >
                    <option value={0}>
                      {loadingCourses
                        ? "Loading courses..."
                        : formData.streamId
                        ? "-- Select Course --"
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

                {/* Microcredential Module* */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Microcredential Module
                  </label>
                  <select
                    value={formData.microcredentialModuleMasterId || formData.moduleMasterId || formData.moduleId || 0}
                    onChange={handleModuleChange}
                    disabled={loadingModules}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800/60 cursor-pointer"
                  >
                    <option value={0}>
                      {loadingModules
                        ? "Loading modules..."
                        : (formData.microcredentialCourseId || formData.courseId)
                        ? "-- Select Module (Optional) --"
                        : "-- Select Course First --"}
                    </option>
                    {modules.map((m) => {
                      const mId = Number(m.microcredentialModuleMasterId ?? m.moduleId ?? m.id ?? 0);
                      const mTitle = m.moduleName || m.name || `Module #${mId}`;
                      return (
                        <option key={mId} value={mId}>
                          {mTitle}
                        </option>
                      );
                    })}
                    {(Number(formData.microcredentialModuleMasterId || formData.moduleMasterId || formData.moduleId) > 0) &&
                      !modules.some(
                        (m) =>
                          Number(m.microcredentialModuleMasterId ?? m.moduleId ?? m.id) ===
                          Number(formData.microcredentialModuleMasterId || formData.moduleMasterId || formData.moduleId)
                      ) && (
                        <option value={formData.microcredentialModuleMasterId || formData.moduleMasterId || formData.moduleId}>
                          {cachedModuleName || `Module #${formData.microcredentialModuleMasterId || formData.moduleMasterId || formData.moduleId}`}
                        </option>
                      )}
                  </select>
                </div>
              </div>

              {/* Row 2: Year Range* */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Year Range <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.yearRange}
                    onChange={(e) => handleChange("yearRange", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                  >
                    <option value="2024 - 2025">2024 - 2025</option>
                    <option value="2025 - 2026">2025 - 2026</option>
                    <option value="2026 - 2027">2026 - 2027</option>
                    <option value="2027 - 2028">2027 - 2028</option>
                    <option value="2028 - 2029">2028 - 2029</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Quiz Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quiz Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter quiz title"
                  value={formData.quizTitle}
                  onChange={(e) => handleChange("quizTitle", e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Row 4: Grade Out Of & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pt-1">
                {/* Grade Out Of */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Grade Out Of
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={formData.gradeOutOf}
                        onChange={(e) => handleChange("gradeOutOf", Number(e.target.value))}
                        className="w-14 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-center font-semibold text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">points</span>
                    </div>

                    <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>

                    <div className="relative">
                      <select
                        value={formData.gradeBook}
                        onChange={(e) => handleChange("gradeBook", e.target.value)}
                        className="rounded-lg border border-transparent bg-transparent py-1 pl-1 pr-6 text-xs font-semibold text-[#a11e22] hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none cursor-pointer"
                      >
                        <option value="Not in Grade Book">Not in Grade Book</option>
                        <option value="In Grade Book">In Grade Book</option>
                      </select>
                    </div>

                    <div
                      className="size-5 rounded-full bg-red-600 text-white font-bold text-[11px] flex items-center justify-center cursor-help shrink-0 shadow-xs"
                      title="Define whether points are tracked in the Grade Book"
                    >
                      ?
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                   Due Date
                  </label>
                  <ThemedDatePicker
                    value={formData.dueDate}
                    placeholder="dd-mmm-yyyy"
                    minDate="today"
                    onChange={(dateStr) => handleChange("dueDate", dateStr)}
                  />
                </div>
              </div>

              {/* Row 5: Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter instructions, learning objectives, and scope of questions for students..."
                  value={formData.quizDescription}
                  onChange={(e) => handleChange("quizDescription", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>

              {/* Row 6: Card Bottom Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => navigate("/microcredential/quiz")}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleNextStep1}
                  className="rounded-xl bg-[#991b1b] hover:bg-[#7f1d1d] px-7 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin size-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Next</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* STEP 2: Accordion Panels (Image 1-5 Right)                       */}
        {/* ================================================================ */}
        {currentStep === 2 && (
          <div className="w-full space-y-4">
            
            {/* 1. AVAILABILITY DATES & CONDITIONS (Image 2) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-visible shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion("availability")}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition cursor-pointer rounded-2xl ${
                  openAccordions.availability
                    ? "border-2 border-teal-400 dark:border-teal-600 bg-teal-50/20 dark:bg-teal-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Availability Dates & Conditions
                </span>
                <span className="text-sm font-bold text-gray-500">
                  {openAccordions.availability ? "—" : "+"}
                </span>
              </button>

              {/* Collapsed summary band (Image 1) */}
              {!openAccordions.availability && (
                <div className="bg-[#f3f0ff] dark:bg-purple-950/30 px-5 py-2.5 text-xs text-gray-700 dark:text-gray-300 font-medium rounded-b-2xl">
                  {formData.startDate || formData.endDate
                    ? `${formatDisplayDate(formData.startDate) || "Start"} to ${formatDisplayDate(formData.endDate) || "End"}`
                    : "Always Available"}
                </div>
              )}

              {/* Expanded Body (Image 2) */}
              {openAccordions.availability && (
                <div className="p-5 space-y-4 border-t border-gray-100 dark:border-gray-800">
                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                      Start Date
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ThemedDatePicker
                        value={formData.startDate}
                        placeholder="dd-----yyyy"
                        minDate="today"
                        onChange={(dStr) => handleChange("startDate", dStr)}
                      />
                      <ThemedTimePicker
                        value={formData.startTime}
                        placeholder="--:-- --"
                        onChange={(tStr) => handleChange("startTime", tStr)}
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                      End Date
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <ThemedDatePicker
                        value={formData.endDate}
                        placeholder="dd-----yyyy"
                        minDate={formData.startDate || "today"}
                        onChange={(dStr) => handleChange("endDate", dStr)}
                      />
                      <ThemedTimePicker
                        value={formData.endTime}
                        placeholder="--:-- --"
                        onChange={(tStr) => handleChange("endTime", tStr)}
                      />
                    </div>
                  </div>

                  {/* Special Access */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Special Access
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Special Access allows quizzes to be available to only a select group of users or individualized due dates for certain users.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveModal("specialAccess")}
                      className="rounded-xl bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#991b1b] text-xs font-semibold px-4 py-2 transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Manage Special Access
                    </button>
                  </div>

                  {/* Password */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Password
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      Only users who enter this password will be granted access to write this quiz.
                    </p>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Enter quiz password"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* IP Restrictions */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      IP Restrictions
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveModal("ipRestrictions")}
                      className="rounded-xl bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#991b1b] text-xs font-semibold px-4 py-2 transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Manage IP Restrictions
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. TIMING & DISPLAY (Image 3) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion("timing")}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition cursor-pointer ${
                  openAccordions.timing
                    ? "border-2 border-teal-400 dark:border-teal-600 bg-teal-50/20 dark:bg-teal-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Timing & Display
                </span>
                <span className="text-sm font-bold text-gray-500">
                  {openAccordions.timing ? "—" : "+"}
                </span>
              </button>

              {/* Collapsed summary band (Image 1) */}
              {!openAccordions.timing && (
                <div className="bg-[#f3f0ff] dark:bg-purple-950/30 px-5 py-2.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {formData.hasTimeLimit
                    ? `${formData.timeLimitMinutes} min time limit`
                    : "No time limit"}
                </div>
              )}

              {/* Expanded Body (Image 3) */}
              {openAccordions.timing && (
                <div className="p-5 space-y-4 border-t border-gray-100 dark:border-gray-800">
                  {/* Set time limit checkbox */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasTimeLimit}
                        onChange={(e) => handleChange("hasTimeLimit", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-xs font-semibold text-gray-800 dark:text-white">
                        Set time limit
                      </span>
                    </label>

                    {formData.hasTimeLimit && (
                      <div className="mt-2.5 pl-6">
                        <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                          Duration (in minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="600"
                          value={formData.timeLimitMinutes}
                          onChange={(e) => handleChange("timeLimitMinutes", Number(e.target.value))}
                          className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Paging */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                      Paging
                    </label>
                    <select
                      value={formData.questionsPerPageId}
                      onChange={(e) => handleChange("questionsPerPageId", Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                    >
                      <option value={0}>All questions displayed together</option>
                      <option value={1}>1 question per page</option>
                      <option value={5}>5 questions per page</option>
                      <option value={10}>10 questions per page</option>
                    </select>
                  </div>

                  {/* Shuffle Quiz */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                      Shuffle Quiz
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shuffleQuestionsAndSections}
                        onChange={(e) => handleChange("shuffleQuestionsAndSections", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400 mt-0.5"
                      />
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
                        Shuffle questions and sections within the quiz. Does not cascade to sub-sections.
                      </span>
                    </label>
                  </div>

                  {/* Display */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Display
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowHints}
                        onChange={(e) => handleChange("allowHints", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        Allow hints
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.disableInternalMessages}
                        onChange={(e) => handleChange("disableInternalMessages", e.target.checked)}
                        className="rounded border-gray-300 text-brand-500 focus:ring-brand-400"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <span>Disable Email, Instant Messages, and Alerts within IgnitoLearn</span>
                        <span
                          className="size-4 rounded-full bg-red-100 text-red-600 font-bold text-[10px] flex items-center justify-center shrink-0"
                          title="Restricts learner messaging during active exam window"
                        >
                          ?
                        </span>
                      </span>
                    </label>
                  </div>

                  {/* Header and Footer */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Header and Footer
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveModal("headerFooter")}
                      className="rounded-xl bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#991b1b] text-xs font-semibold px-4 py-2 transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Manage Header and Footer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. ATTEMPTS & COMPLETION (Image 4 & 5) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion("attempts")}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition cursor-pointer ${
                  openAccordions.attempts
                    ? "border-2 border-teal-400 dark:border-teal-600 bg-teal-50/20 dark:bg-teal-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Attempts & Completion
                </span>
                <span className="text-sm font-bold text-gray-500">
                  {openAccordions.attempts ? "—" : "+"}
                </span>
              </button>

              {/* Collapsed summary band (Image 1) */}
              {!openAccordions.attempts && (
                <div className="bg-[#f3f0ff] dark:bg-purple-950/30 px-5 py-2.5 text-xs text-gray-700 dark:text-gray-300 font-medium space-y-0.5">
                  <div>
                    {Number(formData.attemptsAllowed) > 0
                      ? `${formData.attemptsAllowed} attempt${Number(formData.attemptsAllowed) > 1 ? "s" : ""} allowed`
                      : "No attempts allowed"}
                  </div>
                  <div>Complete after attempt is submitted</div>
                </div>
              )}

              {/* Expanded Body (Image 4 & 5) */}
              {openAccordions.attempts && (
                <div className="p-5 space-y-4 border-t border-gray-100 dark:border-gray-800">
                  {/* Attempts */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Attempts
                    </label>
                    <p className="text-xs font-semibold text-[#a11e22] mb-2">
                      {Number(formData.attemptsAllowed) > 0
                        ? `${formData.attemptsAllowed} Attempt${Number(formData.attemptsAllowed) > 1 ? "s" : ""} Allowed`
                        : "No attempts allowed"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveModal("attempts")}
                      className="rounded-xl bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#991b1b] text-xs font-semibold px-4 py-2 transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Manage Attempts
                    </button>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                      Category
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleChange("categoryId", Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                    >
                      <option value={0}>Select quiz category</option>
                      {categoriesList.map((cat) => (
                        <option
                          key={cat.microcredentialQuizCategoryId || cat.id}
                          value={cat.microcredentialQuizCategoryId || cat.id}
                        >
                          {cat.categoryName || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notification Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Notification Email
                    </label>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
                      To receive notifications when a quiz is attempted, enter an email address or multiple email addresses separated by a comma.
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. professor@ignitoverse.com"
                      value={formData.notificationEmail}
                      onChange={(e) => handleChange("notificationEmail", e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {/* Completion Tracking */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Completion Tracking
                    </label>
                    <p className="text-xs font-semibold text-[#a11e22] mb-2">
                      Complete after attempt is submitted
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveModal("completionTracking")}
                      className="rounded-xl bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#991b1b] text-xs font-semibold px-4 py-2 transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      Manage Completion Tracking
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. EVALUATION & FEEDBACK (Image 1 & 5) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => toggleAccordion("evaluation")}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between transition cursor-pointer ${
                  openAccordions.evaluation
                    ? "border-2 border-teal-400 dark:border-teal-600 bg-teal-50/20 dark:bg-teal-950/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Evaluation & Feedback
                </span>
                <span className="text-sm font-bold text-gray-500">
                  {openAccordions.evaluation ? "—" : "+"}
                </span>
              </button>

              {/* Collapsed summary band (Image 1) */}
              {!openAccordions.evaluation && (
                <div className="bg-[#f3f0ff] dark:bg-purple-950/30 px-5 py-2.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
                  {formData.autoPublishResults
                    ? "Auto-publish results enabled"
                    : "No evaluation/feedback settings configured"}
                </div>
              )}

              {/* Expanded Body */}
              {openAccordions.evaluation && (
                <div className="p-5 space-y-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="flex items-center gap-2 cursor-pointer">
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

                  <label className="flex items-center gap-2 cursor-pointer">
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

                  {formData.deductPoints && (
                    <div className="pl-6">
                      <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                        Deduction Percentage (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.deductionInPercentage}
                        onChange={(e) => handleChange("deductionInPercentage", Number(e.target.value))}
                        className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2 Bottom Action Bar */}
            <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, "continue")}
                className="rounded-xl bg-[#991b1b] hover:bg-[#7f1d1d] px-8 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin size-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving Quiz...</span>
                  </>
                ) : (
                  <span>Next</span>
                )}
              </button>
            </div>
          </div>
        )}

      {/* ================================================================ */}
      {/* POPUP MODALS FOR ACCORDION ACTION BUTTONS                         */}
      {/* ================================================================ */}

      {/* Modal 1: Manage Special Access */}
      {activeModal === "specialAccess" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Manage Special Access
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Grant customized availability dates or override time limits for selected students.
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowSelectedUsersAccess}
                  onChange={(e) => handleChange("allowSelectedUsersAccess", e.target.checked)}
                  className="rounded border-gray-300 text-brand-500"
                />
                <span className="text-xs text-gray-800 dark:text-white">
                  Allow selected users special quiz access
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowOnlySpecialAccessUsers}
                  onChange={(e) => handleChange("allowOnlySpecialAccessUsers", e.target.checked)}
                  className="rounded border-gray-300 text-brand-500"
                />
                <span className="text-xs text-gray-800 dark:text-white">
                  Restrict quiz ONLY to special access users
                </span>
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Specific Student Usernames or Emails
                </label>
                <textarea
                  rows={3}
                  value={formData.specialAccessNotes}
                  onChange={(e) => handleChange("specialAccessNotes", e.target.value)}
                  placeholder="e.g. student1@ignito.com, student2@ignito.com"
                  className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Manage IP Restrictions */}
      {activeModal === "ipRestrictions" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Manage IP Restrictions
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Specify IP addresses or subnets that are permitted to attempt this quiz.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Allowed IP Addresses (comma or newline separated)
              </label>
              <textarea
                rows={4}
                value={formData.ipRestrictions}
                onChange={(e) => handleChange("ipRestrictions", e.target.value)}
                placeholder="e.g. 192.168.1.0/24, 10.0.0.15"
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Manage Header and Footer */}
      {activeModal === "headerFooter" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Manage Header and Footer
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Header Description (Displayed at start of quiz)
                </label>
                <textarea
                  rows={3}
                  value={formData.headerDescription}
                  onChange={(e) => handleChange("headerDescription", e.target.value)}
                  placeholder="Enter header instructions..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Footer Description (Displayed at end of quiz)
                </label>
                <textarea
                  rows={3}
                  value={formData.footerDescription}
                  onChange={(e) => handleChange("footerDescription", e.target.value)}
                  placeholder="Enter footer acknowledgment or notice..."
                  className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Manage Attempts */}
      {activeModal === "attempts" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Manage Attempts
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Attempts Allowed
                </label>
                <select
                  value={Number(formData.attemptsAllowed)}
                  onChange={(e) => handleChange("attemptsAllowed", Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                >
                  <option value={0}>No attempts allowed (or Unlimited)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Attempt Only" : "Attempts"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Overall Grade Calculation
                </label>
                <select
                  value={formData.overallGradeCalculationId}
                  onChange={(e) => handleChange("overallGradeCalculationId", Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer"
                >
                  <option value={1}>Highest Attempt</option>
                  <option value={2}>Average of all Attempts</option>
                  <option value={3}>Latest Attempt</option>
                  <option value={4}>First Attempt</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Manage Completion Tracking */}
      {activeModal === "completionTracking" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Manage Completion Tracking
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="completionType"
                  value="1"
                  checked={formData.autoCompletionTypeId === "1"}
                  onChange={(e) => handleChange("autoCompletionTypeId", e.target.value)}
                  className="text-brand-500 focus:ring-brand-400"
                />
                <span className="text-xs text-gray-800 dark:text-white">
                  Complete after attempt is submitted
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="completionType"
                  value="2"
                  checked={formData.autoCompletionTypeId === "2"}
                  onChange={(e) => handleChange("autoCompletionTypeId", e.target.value)}
                  className="text-brand-500 focus:ring-brand-400"
                />
                <span className="text-xs text-gray-800 dark:text-white">
                  Complete after passing grade is achieved
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600 transition"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Master Modal if needed */}
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
