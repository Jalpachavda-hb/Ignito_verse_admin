import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import { CheckCircleIcon } from "../../icons";
import { createZoomMeeting } from "../../services/microcredentialZoomService";
import {
  getStreamData,
  getMicrocredentialCourse,
} from "../../services/adminMicrocredentialService";
import { useToast } from "../../context/ToastContext";

const MEETING_TYPES = [
  { value: "scheduled", label: "Scheduled Meeting" },
  { value: "Live Class", label: "Live Class" },
  { value: "Doubt Clearing Session", label: "Doubt Clearing Session" },
  { value: "Orientation", label: "Orientation" },
  { value: "Webinar", label: "Webinar" },
  { value: "One-on-One Mentorship", label: "One-on-One Mentorship" },
  { value: "recurring", label: "Recurring Meeting" },
];

export default function CreateZoomMeeting() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Dropdown states
  const [streamList, setStreamList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Submitting & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    microcredentialCourseId: "",
    meetingName: "",
    meetingType: "scheduled",
    meetingDateAndTime: "",
    duration: 60,
    isPrivate: false,
  });

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

  const handleStreamChange = (e) => {
    setSelectedStreamId(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStreamId) {
      showToast("Please select a Stream", "error");
      return;
    }
    if (!formData.microcredentialCourseId) {
      showToast("Please select a Microcredential Course", "error");
      return;
    }
    if (!formData.meetingName.trim()) {
      showToast("Please enter Meeting Name", "error");
      return;
    }
    if (!formData.meetingDateAndTime) {
      showToast("Please select Meeting Date & Time", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createZoomMeeting({
        microcredentialCourseId: Number(formData.microcredentialCourseId),
        meetingName: formData.meetingName.trim(),
        meetingType: formData.meetingType,
        meetingDateAndTime: formData.meetingDateAndTime,
        duration: Number(formData.duration) || 60,
        isPrivate: formData.isPrivate,
      });

      if (res?.isSuccess) {
        showToast(res.message || "Zoom meeting created successfully!", "success");
        setTimeout(() => {
          navigate("/zoom-meeting-list");
        }, 1200);
      } else {
        showToast(res?.message || "Failed to create Zoom meeting. Please try again.", "error");
      }
    } catch (err) {
      console.error("Create Zoom Meeting error:", err);
      showToast("An unexpected error occurred while creating the Zoom meeting.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Create Zoom Meeting | Ignito Verse Admin"
        description="Schedule a new Zoom online meeting session with stream and course selection."
      />

      <PageBreadcrumb pageTitle="Create Zoom Meeting" />

      {/* Main Create Form Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Create Zoom Meeting
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enter course parameters and schedule details to generate a live Zoom conference session.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/zoom-meeting-list")}
            className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            Back to List
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
          {/* Row 1: Select Stream & Select Course (Cascading) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Stream Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                  Select Stream <span className="text-red-500">*</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) =>
                      setFormData({ ...formData, isPrivate: e.target.checked })
                    }
                    className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                  />
                  <span>Is Private</span>
                </label>
              </div>
              <select
                value={selectedStreamId}
                onChange={handleStreamChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
                disabled={loadingStreams}
              >
                <option value="">
                  {loadingStreams ? "Loading streams..." : "-- Choose Stream --"}
                </option>
                {streamList.map((st) => (
                  <option key={st.streamId} value={st.streamId}>
                    {st.streamName}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Dropdown */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                Select Microcredential Course <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.microcredentialCourseId}
                onChange={(e) =>
                  setFormData({ ...formData, microcredentialCourseId: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
                disabled={!selectedStreamId || loadingCourses}
              >
                <option value="">
                  {!selectedStreamId
                    ? "-- Select Stream First --"
                    : loadingCourses
                    ? "Loading courses..."
                    : courseList.length === 0
                    ? "No courses found under this stream"
                    : "-- Choose Microcredential Course --"}
                </option>
                {courseList.map((c) => {
                  const courseId = c.microcredentialCourseId || c.id;
                  const name =
                    c.microcredentialCourseName || c.courseName || `Course #${courseId}`;
                  return (
                    <option key={courseId} value={courseId}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Row 2: Meeting Type, Meeting Name, Date & Time, Duration */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Meeting Type */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                Meeting Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.meetingType}
                onChange={(e) =>
                  setFormData({ ...formData, meetingType: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              >
                {MEETING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Name */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                Meeting Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.meetingName}
                onChange={(e) =>
                  setFormData({ ...formData, meetingName: e.target.value })
                }
                placeholder="e.g. Python Advanced Live Masterclass"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            {/* Date & Time */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                Date &amp; Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.meetingDateAndTime}
                onChange={(e) =>
                  setFormData({ ...formData, meetingDateAndTime: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            {/* Duration (in Minute) */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                Duration (in Minute) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g. 60"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Form Actions (Cancel & Create Meeting) */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate("/zoom-meeting-list")}
              className="rounded-xl bg-gray-800 px-6 py-2.5 font-semibold text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 transition cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition cursor-pointer shadow-theme-xs"
            >
              {isSubmitting ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
