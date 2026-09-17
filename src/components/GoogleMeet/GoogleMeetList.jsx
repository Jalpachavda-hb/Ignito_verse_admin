import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  PencilIcon,
  TrashBinIcon,
  CopyIcon,
  CheckCircleIcon,
  CloseIcon,
  PlusIcon,
  UserIcon,
  VideoIcon,
} from "../../icons";
import {
  getGoogleMeetList,
  deleteGoogleMeetById,
  getGoogleMeetAttendees,
  getGoogleMeetRecordingAndAttendeeInfo,
} from "../../services/microcredentialGoogleMeetService";

export default function GoogleMeetList() {
  const navigate = useNavigate();

  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState("CreatedOn");
  const [sortOrder, setSortOrder] = useState("DESC");

  // View Modals state
  const [viewingDescription, setViewingDescription] = useState(null);
  const [viewingAttendees, setViewingAttendees] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [viewingRecording, setViewingRecording] = useState(null);
  const [recordingInfo, setRecordingInfo] = useState(null);
  const [loadingRecording, setLoadingRecording] = useState(false);
  const [deleteConfirmMeet, setDeleteConfirmMeet] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(`Copied to clipboard!`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Fetch Google Meet List from API
  const fetchMeets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getGoogleMeetList({
        pageNo: currentPage,
        pageSize: pageSize,
        orderByColumn: sortField,
        orderByDirection: sortOrder,
      });

      if (res?.isSuccess && Array.isArray(res?.googleMeetList)) {
        setMeets(res.googleMeetList);
        if (res?.pageDetail?.totalRecords !== undefined) {
          setTotalRecords(res.pageDetail.totalRecords);
        } else {
          setTotalRecords(res.googleMeetList.length);
        }
      } else if (Array.isArray(res?.data)) {
        setMeets(res.data);
        setTotalRecords(res.data.length);
      } else {
        setMeets([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Failed to fetch Google Meet list:", err);
      showToast("Error loading meetings from server");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortOrder]);

  useEffect(() => {
    fetchMeets();
  }, [fetchMeets]);

  const handleDeleteMeet = async () => {
    if (!deleteConfirmMeet) return;
    try {
      setIsDeleting(true);
      const res = await deleteGoogleMeetById({
        googleMeetMasterId: deleteConfirmMeet.googleMeetMasterId,
        eventId: deleteConfirmMeet.eventId || "",
      });

      if (res?.isSuccess) {
        showToast("Google Meet removed successfully.");
        setDeleteConfirmMeet(null);
        fetchMeets();
      } else {
        alert(res?.message || "Failed to delete meeting.");
      }
    } catch (err) {
      console.error("Delete meet error:", err);
      alert("Error deleting meeting.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Attendees Modal
  const openAttendeesModal = async (meet) => {
    setViewingAttendees(meet);
    setAttendeesList([]);
    try {
      setLoadingAttendees(true);
      const res = await getGoogleMeetAttendees(meet.googleMeetMasterId);
      if (res?.isSuccess && Array.isArray(res?.meetAttendees)) {
        setAttendeesList(res.meetAttendees);
      } else if (Array.isArray(res?.data)) {
        setAttendeesList(res.data);
      }
    } catch (err) {
      console.error("Error loading attendees:", err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  // Open Live RSVP / Recording Modal
  const openRecordingModal = async (meet) => {
    setViewingRecording(meet);
    setRecordingInfo(null);
    if (!meet.eventId) {
      showToast("No Google Calendar Event ID linked for this meeting");
      return;
    }
    try {
      setLoadingRecording(true);
      const res = await getGoogleMeetRecordingAndAttendeeInfo(meet.eventId);
      if (res?.isSuccess) {
        setRecordingInfo(res);
      } else {
        showToast(res?.message || "No recording or RSVP details found yet");
      }
    } catch (err) {
      console.error("Error fetching recording details:", err);
    } finally {
      setLoadingRecording(false);
    }
  };

  // Filter Search
  const filteredMeets = useMemo(() => {
    if (!searchQuery.trim()) return meets;
    const q = searchQuery.toLowerCase();
    return meets.filter(
      (m) =>
        (m.courseName && m.courseName.toLowerCase().includes(q)) ||
        (m.meetTitle && m.meetTitle.toLowerCase().includes(q)) ||
        (m.meetDescription && m.meetDescription.toLowerCase().includes(q)) ||
        (m.eventId && m.eventId.toLowerCase().includes(q)) ||
        (m.meetLink && m.meetLink.toLowerCase().includes(q))
    );
  }, [meets, searchQuery]);

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <>
      <PageMeta
        title="Microcredential Google Meet List | Ignito Verse Admin"
        description="Schedule, manage and start Google Meet sessions synced with Google Calendar."
      />

      <PageBreadcrumb pageTitle="Google Meet List" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircleIcon className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Google Meet List</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live Google Meet conferences synced with Google Calendar and student FCM alerts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/create-google-meet")}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600 transition cursor-pointer"
          >
            <PlusIcon className="size-4" />
            <span>+ Add New Meet</span>
          </button>
        </div>

        {/* Filter / Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-xs border-b border-gray-100 dark:border-gray-800">
          {/* Show Entries */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-3.5 pr-8 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Responsive Table Container with Slim Scrollbar */}
        <div className="w-full max-w-full overflow-x-auto custom-scrollbar pb-2">
          <table className="w-full min-w-[1300px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3.5">Course Name</th>
                <th className="px-4 py-3.5">Meet Title</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Google Meet Link</th>
                <th className="px-4 py-3.5">Event ID</th>
                <th className="px-4 py-3.5">Start Date &amp; Time</th>
                <th className="px-4 py-3.5">End Date &amp; Time</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap">Attendees</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap">Recordings &amp; RSVP</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap">Is Private</th>
                <th className="px-3 py-3.5 text-center whitespace-nowrap">Reminder</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Created On</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-14 text-center text-sm text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                      <span>Loading Google Meet sessions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMeets.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-14 text-center text-sm text-gray-400 font-medium">
                    No Google Meet sessions found. Click <strong>+ Add New Meet</strong> to schedule one.
                  </td>
                </tr>
              ) : (
                filteredMeets.map((meet) => {
                  const isPrivate = meet.isPrivateMeeting === true || meet.isPrivateMeeting === "True";
                  const isReminder = meet.isReminderSet === true || meet.isReminderSet === "True";

                  return (
                    <tr
                      key={meet.googleMeetMasterId || meet.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Course Name */}
                      <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white max-w-[200px]">
                        <div className="line-clamp-2">{meet.courseName || "Microcredential Course"}</div>
                      </td>

                      {/* Meet Title */}
                      <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white max-w-[190px]">
                        <div className="line-clamp-2">{meet.meetTitle}</div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-300 max-w-[200px]">
                        <div className="line-clamp-2 text-[11px] leading-relaxed">
                          {meet.meetDescription || "No description provided"}
                        </div>
                        {meet.meetDescription && meet.meetDescription.length > 55 && (
                          <button
                            type="button"
                            onClick={() => setViewingDescription(meet)}
                            className="mt-0.5 text-[10px] font-bold text-gray-900 hover:underline dark:text-white cursor-pointer"
                          >
                            Read More
                          </button>
                        )}
                      </td>

                      {/* Google Meet Link */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {meet.meetLink ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <a
                              href={meet.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 hover:underline dark:text-brand-400 max-w-[170px] truncate block"
                              title={meet.meetLink}
                            >
                              {meet.meetLink}
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(meet.meetLink, `link-${meet.googleMeetMasterId}`)}
                              className="text-gray-400 hover:text-brand-500 cursor-pointer"
                              title="Copy Google Meet Link"
                            >
                              <CopyIcon className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Not Generated</span>
                        )}
                      </td>

                      {/* Event ID */}
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {meet.eventId ? (
                          <div className="flex items-center gap-1">
                            <span className="max-w-[120px] truncate" title={meet.eventId}>
                              {meet.eventId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(meet.eventId, `event-${meet.googleMeetMasterId}`)}
                              className="text-gray-400 hover:text-brand-500 cursor-pointer"
                              title="Copy Event ID"
                            >
                              <CopyIcon className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      {/* Start Time */}
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap text-[11px] font-medium">
                        {meet.meetStartDateTime}
                      </td>

                      {/* End Time */}
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap text-[11px] font-medium">
                        {meet.meetEndDateTime}
                      </td>

                      {/* Attendees */}
                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openAttendeesModal(meet)}
                          title="View Registered Attendees"
                          className="inline-flex size-7 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition cursor-pointer"
                        >
                          <UserIcon className="size-3.5" />
                        </button>
                      </td>

                      {/* Recordings & Live RSVP */}
                      <td className="px-3 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openRecordingModal(meet)}
                          title="View Live RSVP Status & Drive Recordings"
                          className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 transition cursor-pointer"
                        >
                          <VideoIcon className="size-3.5" />
                        </button>
                      </td>

                      {/* Is Private Meeting */}
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isPrivate
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {isPrivate ? "Yes" : "No"}
                        </span>
                      </td>

                      {/* Is Reminder Set */}
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isReminder
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {isReminder ? "Yes" : "No"}
                        </span>
                      </td>

                      {/* Created On */}
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[11px]">
                        {meet.createdOn}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/edit-google-meet/${meet.googleMeetMasterId}`)}
                            title="Edit Google Meet (Page)"
                            className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 transition cursor-pointer"
                          >
                            <PencilIcon className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmMeet(meet)}
                            title="Delete Google Meet"
                            className="inline-flex size-7 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition cursor-pointer"
                          >
                            <TrashBinIcon className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium shadow-xs disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setCurrentPage(num)}
                className={`size-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                  currentPage === num
                    ? "bg-brand-500 text-white shadow-xs"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-medium shadow-xs disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: VIEW DESCRIPTION */}
      {viewingDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setViewingDescription(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <CloseIcon className="size-5" />
            </button>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              {viewingDescription.meetTitle}
            </h4>
            <p className="text-xs text-brand-600 font-semibold mb-4">
              {viewingDescription.courseName}
            </p>
            <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
              {viewingDescription.meetDescription}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingDescription(null)}
                className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW ATTENDEES */}
      {viewingAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setViewingAttendees(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <CloseIcon className="size-5" />
            </button>
            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Registered Attendees
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate">
              {viewingAttendees.meetTitle}
            </p>

            {loadingAttendees ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading student attendees...</div>
            ) : attendeesList.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">No registered attendees found.</div>
            ) : (
              <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2.5">
                {attendeesList.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/60"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {att.studentName || att.name || "Student"}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{att.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAttendees(null)}
                className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORDINGS & LIVE RSVP */}
      {viewingRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto custom-scrollbar rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setViewingRecording(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <CloseIcon className="size-5" />
            </button>

            <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Live RSVP &amp; Drive Recordings
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Google Calendar Event ID: <code className="text-brand-600 font-mono">{viewingRecording.eventId}</code>
            </p>

            {loadingRecording ? (
              <div className="py-8 text-center text-xs text-gray-400">
                Fetching Google Drive recordings &amp; RSVP statuses...
              </div>
            ) : !recordingInfo ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No recording or attendee RSVP data returned for this event.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Recordings Section */}
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Google Drive Recordings</h5>
                  {recordingInfo.recordingUrls && recordingInfo.recordingUrls.length > 0 ? (
                    <div className="space-y-2">
                      {recordingInfo.recordingUrls.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800"
                        >
                          <div className="truncate mr-2">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">
                              {rec.title || "Meeting Recording.mp4"}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">{rec.mimeType || "video/mp4"}</div>
                          </div>
                          <a
                            href={rec.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 whitespace-nowrap"
                          >
                            Watch Recording
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 p-3 text-gray-500 dark:bg-gray-800 text-[11px]">
                      No video recordings attached to this Google Calendar event yet.
                    </div>
                  )}
                </div>

                {/* Live RSVP Status Section */}
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Live RSVP Responses</h5>
                  {recordingInfo.attendees && recordingInfo.attendees.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                      {recordingInfo.attendees.map((att, i) => {
                        const statusColors = {
                          accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                          declined: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
                          tentative: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                          needsAction: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                        };
                        const colorClass = statusColors[att.responseStatus] || statusColors.needsAction;

                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800"
                          >
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {att.displayName || att.email}
                              </div>
                              <div className="text-[10px] text-gray-500">{att.email}</div>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${colorClass}`}>
                              {att.responseStatus}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-gray-50 p-3 text-gray-500 dark:bg-gray-800 text-[11px]">
                      No attendee RSVP responses recorded.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingRecording(null)}
                className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {deleteConfirmMeet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800 text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600">
              <TrashBinIcon className="size-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">Delete Google Meet?</h4>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to delete and cancel{" "}
              <strong className="text-gray-800 dark:text-gray-200">{deleteConfirmMeet.meetTitle}</strong>? This will cancel the Google Calendar event and cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmMeet(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteMeet}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
