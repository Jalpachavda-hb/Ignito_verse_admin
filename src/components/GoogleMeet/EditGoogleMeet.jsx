import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import { CheckCircleIcon } from "../../icons";
import {
  getGoogleMeetById,
  createOrUpdateGoogleMeet,
} from "../../services/microcredentialGoogleMeetService";
import {
  getStreamData,
  getMicrocredentialCourse,
} from "../../services/adminMicrocredentialService";

export default function EditGoogleMeet() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Dropdown states
  const [streamList, setStreamList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Submitting & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    googleMeetMasterId: 0,
    microcredentialCourseId: "",
    eventId: null,
    summary: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    isPrivateMeeting: false,
    isReminderSet: true,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
      navigate("/google-meet-list");
    }, 1200);
  };

  // 1. Fetch Streams
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
        console.error("Error loading stream list:", err);
      } finally {
        if (isMounted) setLoadingStreams(false);
      }
    }
    loadStreams();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Meeting Data by ID
  const fetchMeetingData = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      const res = await getGoogleMeetById(id);

      if (res) {
        const formatIso = (dateStr) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          return d.toISOString().slice(0, 16);
        };

        const targetCourseId = res.microcredentialCourseId ? String(res.microcredentialCourseId) : "";
        const targetStreamId = res.streamId ? String(res.streamId) : "";

        setFormData({
          googleMeetMasterId: res.googleMeetMasterId || Number(id),
          microcredentialCourseId: targetCourseId,
          eventId: res.eventId || null,
          summary: res.meetTitle || res.summary || "",
          description: res.meetDescription || res.description || "",
          startDateTime: formatIso(res.meetStartDateTime || res.startDateTime),
          endDateTime: formatIso(res.meetEndDateTime || res.endDateTime),
          isPrivateMeeting: res.isPrivateMeeting === true || res.isPrivateMeeting === "True",
          isReminderSet: res.isReminderSet === true || res.isReminderSet === "True",
        });

        if (targetStreamId) {
          setSelectedStreamId(targetStreamId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch meeting details:", err);
      alert("Error loading meeting details.");
    } finally {
      setLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeetingData();
  }, [fetchMeetingData]);

  // 3. Fetch Courses whenever Stream changes or upon initial load
  useEffect(() => {
    let isMounted = true;
    async function loadCourses() {
      if (!selectedStreamId) {
        // If stream not yet selected but courseId exists, load all courses or wait
        try {
          const res = await getMicrocredentialCourse("");
          if (isMounted && res && res.success) {
            setCourseList(res.microcredentialCourseOutputList || []);
          }
        } catch {}
        return;
      }

      setLoadingCourses(true);
      try {
        const res = await getMicrocredentialCourse(selectedStreamId);
        if (isMounted && res && res.success) {
          setCourseList(res.microcredentialCourseOutputList || []);
        } else {
          setCourseList([]);
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
    const streamId = e.target.value;
    setSelectedStreamId(streamId);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.microcredentialCourseId) {
      alert("Please select a Microcredential Course");
      return;
    }
    if (!formData.summary.trim()) {
      alert("Please enter Meet Title / Summary");
      return;
    }
    if (!formData.startDateTime || !formData.endDateTime) {
      alert("Please enter both Start Date & Time and End Date & Time");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createOrUpdateGoogleMeet({
        googleMeetMasterId: Number(formData.googleMeetMasterId || id),
        microcredentialCourseId: Number(formData.microcredentialCourseId),
        eventId: formData.eventId,
        summary: formData.summary,
        description: formData.description,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        isPrivateMeeting: formData.isPrivateMeeting,
        isReminderSet: formData.isReminderSet,
      });

      if (res?.isSuccess) {
        showToast(res.message || "Google Meet updated successfully!");
      } else {
        alert(res?.message || "Failed to update Google Meet. Please try again.");
      }
    } catch (err) {
      console.error("Update Google Meet error:", err);
      alert("An unexpected error occurred while updating the meeting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Edit Google Meet | Ignito Verse Admin"
        description="Update Google Meet schedule and sync with Google Calendar."
      />

      <PageBreadcrumb pageTitle="Edit Google Meet" />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircleIcon className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Edit Google Meet Session
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Modify meeting timings, course linkage, or agenda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/google-meet-list")}
            className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            Back to List
          </button>
        </div>

        {loadingData ? (
          <div className="py-16 text-center text-xs text-gray-400">
            <div className="inline-flex items-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
              <span>Loading meeting details...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
            {/* Row 1: Stream Dropdown & Course Dropdown */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Stream Dropdown */}
              <div>
                <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                  Select Stream <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStreamId}
                  onChange={handleStreamChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  disabled={loadingCourses}
                >
                  <option value="">
                    {loadingCourses ? "Loading courses..." : "-- Choose Microcredential Course --"}
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

            {/* Meet Title / Summary */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                Meet Title / Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="e.g. Live Microcredential Expert Masterclass"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>

            {/* Description / Agenda */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                Description / Agenda
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add session details, prerequisites, or topics to be covered..."
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white leading-relaxed"
              />
            </div>

            {/* Start and End Date Time */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                  Start Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startDateTime: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-800 dark:text-gray-200 text-xs">
                  End Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300 select-none">
                <input
                  type="checkbox"
                  checked={formData.isPrivateMeeting}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrivateMeeting: e.target.checked })
                  }
                  className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                />
                <span>Is Private Meeting</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300 select-none">
                <input
                  type="checkbox"
                  checked={formData.isReminderSet}
                  onChange={(e) =>
                    setFormData({ ...formData, isReminderSet: e.target.checked })
                  }
                  className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                />
                <span>Set 10-Minute Reminder</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => navigate("/google-meet-list")}
                className="rounded-xl bg-gray-800 px-6 py-2.5 font-semibold text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 transition cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-brand-500 px-6 py-2.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition cursor-pointer shadow-theme-xs"
              >
                {isSubmitting ? "Updating..." : "Update Google Meet"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
