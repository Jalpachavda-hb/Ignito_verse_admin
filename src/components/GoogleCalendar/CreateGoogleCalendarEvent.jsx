import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import { CheckCircleIcon } from "../../icons";
import { createGoogleCalendarEvent } from "../../services/microcredentialGoogleCalendarService";
import {
  getStreamData,
  getMicrocredentialCourse,
} from "../../services/adminMicrocredentialService";

const EVENT_TYPES = [
  { value: "Live Workshop", label: "Live Workshop" },
  { value: "Course Orientation", label: "Course Orientation" },
  { value: "Review Session", label: "Review Session" },
  { value: "Doubt Clearing Session", label: "Doubt Clearing Session" },
  { value: "Webinar", label: "Webinar" },
  { value: "One-on-One Mentorship", label: "One-on-One Mentorship" },
  { value: "Scheduled Event", label: "Scheduled Event" },
];

export default function CreateGoogleCalendarEvent() {
  const navigate = useNavigate();

  // Dropdown states
  const [streamList, setStreamList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Submitting & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    microcredentialCourseId: "",
    eventTitle: "",
    eventType: "Live Workshop",
    startDateTime: "",
    endDateTime: "",
    description: "",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
      navigate("/google-calendar-list");
    }, 1200);
  };

  // 1. Fetch Streams on mount
  useEffect(() => {
    let isMounted = true;
    async function loadStreams() {
      setLoadingStreams(true);
      try {
        const streamRes = await getStreamData();
        if (isMounted && streamRes && streamRes.success) {
          setStreamList(streamRes.streamDataList || []);
        }
      } catch (err) {
        console.error("Error loading streams:", err);
      } finally {
        if (isMounted) setLoadingStreams(false);
      }
    }
    loadStreams();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Courses when Stream changes
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      if (!selectedStreamId) {
        setCourseList([]);
        setFormData((prev) => ({ ...prev, microcredentialCourseId: "" }));
        return;
      }

      setLoadingCourses(true);
      try {
        const res = await getMicrocredentialCourse(selectedStreamId);
        if (isMounted && res && res.success) {
          const list = res.microcredentialCourseOutputList || [];
          setCourseList(list);
          if (list.length > 0) {
            setFormData((prev) => ({
              ...prev,
              microcredentialCourseId: String(list[0].microcredentialCourseId),
            }));
          } else {
            setFormData((prev) => ({ ...prev, microcredentialCourseId: "" }));
          }
        } else {
          setCourseList([]);
          setFormData((prev) => ({ ...prev, microcredentialCourseId: "" }));
        }
      } catch (err) {
        console.error("Error loading courses for stream:", err);
        setCourseList([]);
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    }
    loadCourses();
    return () => {
      isMounted = false;
    };
  }, [selectedStreamId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStreamId) {
      alert("Please select a Stream.");
      return;
    }

    if (!formData.microcredentialCourseId) {
      alert("Please select a Microcredential Course.");
      return;
    }

    if (!formData.eventTitle.trim()) {
      alert("Please enter an Event Title.");
      return;
    }

    if (!formData.startDateTime) {
      alert("Please specify the Start Date & Time.");
      return;
    }

    if (!formData.endDateTime) {
      alert("Please specify the End Date & Time.");
      return;
    }

    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      alert("End Date & Time must be after Start Date & Time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        microcredentialCourseId: Number(formData.microcredentialCourseId),
        eventTitle: formData.eventTitle.trim(),
        eventType: formData.eventType,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        description: formData.description.trim(),
      };

      const res = await createGoogleCalendarEvent(payload);

      if (res && res.isSuccess) {
        showToast(res.message || "Google Calendar event created successfully!");
      } else {
        alert(res?.message || "Failed to create Google Calendar event. Please try again.");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <PageMeta
        title="Create Google Calendar Event | IgnitoVerse Admin"
        description="Schedule a new Google Calendar event and sync it with enrolled students."
      />
      <PageBreadcrumb pageTitle="Create Google Calendar Event" />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-2xl dark:bg-white dark:text-gray-900 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircleIcon className="size-5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800 sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Create Google Calendar Event
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select stream and course to generate a live Google Calendar event and send FCM push notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/google-calendar-list")}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
          >
            ← Back to Events List
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Stream Selector */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Select Stream <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStreamId}
                onChange={(e) => setSelectedStreamId(e.target.value)}
                disabled={loadingStreams}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-xs font-medium text-gray-800 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                required
              >
                <option value="">
                  {loadingStreams ? "Loading streams..." : "Select Stream"}
                </option>
                {streamList.map((st) => (
                  <option key={st.streamId} value={st.streamId}>
                    {st.streamName}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selector (Cascaded) */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Select Microcredential Course <span className="text-red-500">*</span>
              </label>
              <select
                name="microcredentialCourseId"
                value={formData.microcredentialCourseId}
                onChange={handleChange}
                disabled={!selectedStreamId || loadingCourses}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-xs font-medium text-gray-800 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                required
              >
                {!selectedStreamId ? (
                  <option value="">Please select a stream first</option>
                ) : loadingCourses ? (
                  <option value="">Loading courses...</option>
                ) : courseList.length === 0 ? (
                  <option value="">No courses available in this stream</option>
                ) : (
                  courseList.map((crs) => (
                    <option
                      key={crs.microcredentialCourseId}
                      value={crs.microcredentialCourseId}
                    >
                      {crs.courseName}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Event Title */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventTitle"
                value={formData.eventTitle}
                onChange={handleChange}
                placeholder="e.g. AI & ML Workshop - Live Q&A Session"
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-xs font-medium text-gray-800 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                required
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-xs font-medium text-gray-800 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date & Time */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-xs font-medium text-gray-800 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                required
              />
            </div>

            {/* End Date & Time */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 text-xs font-medium text-gray-800 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                required
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Description / Agenda
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Interactive live discussion and project Q&A for Microcredential students..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-xs font-medium text-gray-800 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate("/google-calendar-list")}
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 active:scale-98 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Scheduling Event...</span>
                </>
              ) : (
                <span>Save Calendar Event</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
