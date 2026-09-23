import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import { Modal } from "../ui/modal";
import {
  EyeIcon,
  CopyIcon,
  CheckCircleIcon,
  CloseIcon,
  PlusIcon,
  CalenderIcon,
  TimeIcon,
} from "../../icons";
import { getGoogleCalendarEventList } from "../../services/microcredentialGoogleCalendarService";
import { useToast } from "../../context/ToastContext";

export default function GoogleCalendarList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("calendar"); // "calendar" | "table"
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const calendarRef = useRef(null);

  // Modals state
  const [viewingEvent, setViewingEvent] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ID: ${text}`, "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await getGoogleCalendarEventList({
        pageNo: currentPage,
        pageSize: pageSize,
        searchInput: searchQuery,
      });

      if (res && res.isSuccess && Array.isArray(res.googleCalenderEventList)) {
        setEvents(res.googleCalenderEventList);
        setTotalRecords(res.pageDetail?.totalRecords ?? res.googleCalenderEventList.length);
      } else {
        setEvents(res?.googleCalenderEventList || []);
        setTotalRecords(res?.pageDetail?.totalRecords ?? 0);
      }
    } catch (err) {
      console.error("Error fetching Google Calendar events:", err);
      showToast("Error loading Google Calendar events.", "error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  // Convert API events to FullCalendar event format
  const fullCalendarEvents = useMemo(() => {
    return events.map((e) => {
      let start = e.startDateTime;
      let end = e.endDateTime;
      if (start && start.includes(" ") && !start.includes("T")) {
        start = start.replace(" ", "T");
      }
      if (end && end.includes(" ") && !end.includes("T")) {
        end = end.replace(" ", "T");
      }

      return {
        id: String(e.googleEventId || e.eventId || Math.random()),
        title: e.eventTitle || "Google Calendar Event",
        start,
        end,
        backgroundColor: "#4f46e5",
        borderColor: "#4338ca",
        extendedProps: { ...e },
      };
    });
  }, [events]);

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <PageMeta
        title="Google Calendar | IgnitoVerse Admin"
        description="View and synchronize academic calendar events, lectures, and live sessions."
      />
      <PageBreadcrumb pageTitle="Google Calender" />

      {/* Main Container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900 w-full max-w-full min-w-0 overflow-hidden">
        {/* Top Bar with Title, Action Button & Tabs */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                Google Calender
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Centralized academic schedule, Google Calendar synchronization, and event management
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/create-google-calendar-event")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 active:scale-98 transition cursor-pointer"
            >
              <PlusIcon className="size-4" />
              <span>Create Google Calendar Event</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-1">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <CalenderIcon className="size-4" />
              <span>Calender View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "table"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <span>Calender Events List</span>
              <span className="rounded-full bg-black/10 dark:bg-white/10 px-2 py-0.5 text-[10px]">
                {totalRecords}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CALENDAR VIEW */}
        {/* ========================================================================= */}
        {activeTab === "calendar" && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span>📅 View Calender</span>
                <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                  (Click any event on calendar to view full details)
                </span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => calendarRef.current?.getApi().today()}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => calendarRef.current?.getApi().changeView("dayGridMonth")}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => calendarRef.current?.getApi().changeView("timeGridWeek")}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
                >
                  Week
                </button>
                <button
                  type="button"
                  onClick={() => calendarRef.current?.getApi().changeView("listMonth")}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition"
                >
                  List
                </button>
              </div>
            </div>

            {/* Calendar Container */}
            <div className="custom-calendar rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 overflow-hidden min-h-[480px] relative">
              {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs dark:bg-gray-900/70">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-500 border-t-transparent"></div>
                  <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-400">
                    Loading events...
                  </p>
                </div>
              )}

              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                }}
                events={fullCalendarEvents}
                eventClick={(info) => {
                  const raw = info.event.extendedProps;
                  if (raw) setViewingEvent(raw);
                }}
                height="auto"
                dayMaxEvents={3}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CALENDAR EVENTS LIST TABLE */}
        {/* ========================================================================= */}
        {activeTab === "table" && (
          <div>
            {/* Table Controls */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-center">
                {/* Show Entries */}
                <div className="flex items-center gap-2 lg:col-span-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>entries</span>
                </div>

                {/* Search */}
                <div className="lg:col-span-8 relative">
                  <input
                    type="text"
                    placeholder="Search by event title, id, or course name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-3.5 pr-9 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:bg-gray-900"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                        fetchEvents();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Table */}
            <div className="w-full max-w-full overflow-x-auto custom-scrollbar pb-2">
              <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    <th className="px-5 py-3.5 w-[280px]">Course Details</th>
                    <th className="px-4 py-3.5">Event Id</th>
                    <th className="px-4 py-3.5">Event Title</th>
                    <th className="px-4 py-3.5">Event Type</th>
                    <th className="px-5 py-3.5">Schedule</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Updated On</th>
                    <th className="px-4 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                          <span>Loading calendar events...</span>
                        </div>
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CalenderIcon className="size-8 text-gray-300 dark:text-gray-600" />
                          <p className="font-semibold text-gray-700 dark:text-gray-300">No events found</p>
                          <p className="text-xs text-gray-400">Schedule your first Google Calendar event using the button above.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    events.map((evt) => (
                      <tr key={evt.googleEventId || evt.eventId} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                        {/* Course Details */}
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900 dark:text-white leading-snug">
                            {evt.courseName || "Microcredential Course"}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {evt.programmeName || "Microcredential"} {evt.semesterNumber ? `• Sem ${evt.semesterNumber}` : ""}
                          </div>
                        </td>

                        {/* Event Id */}
                        <td className="px-4 py-3.5 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-brand-600 dark:text-brand-400">
                              {evt.eventId || `evt_${evt.googleEventId}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(evt.eventId || String(evt.googleEventId), evt.googleEventId)}
                              title="Copy Event ID"
                              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                            >
                              <CopyIcon className="size-3.5" />
                            </button>
                            {copiedKey === evt.googleEventId && (
                              <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>
                            )}
                          </div>
                        </td>

                        {/* Event Title */}
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {evt.eventTitle}
                          </span>
                        </td>

                        {/* Event Type */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            {evt.eventType || "Event"}
                          </span>
                        </td>

                        {/* Schedule */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium">
                            <TimeIcon className="size-3.5 text-gray-400" />
                            <span>{evt.startDateTime}</span>
                          </div>
                          {evt.endDateTime && (
                            <div className="text-[11px] text-gray-400 ml-5">
                              to {evt.endDateTime}
                            </div>
                          )}
                        </td>

                        {/* Updated On */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400 text-[11px]">
                          {evt.updatedOn || "—"}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingEvent(evt)}
                            title="View Event Details"
                            className="inline-flex size-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-950/40 dark:hover:text-brand-400 transition cursor-pointer"
                          >
                            <EyeIcon className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <div>
                Showing {totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Previous
                </button>
                <span className="px-3 py-1 font-semibold text-gray-800 dark:text-gray-200">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 font-medium hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Event Detail Modal */}
      <Modal isOpen={Boolean(viewingEvent)} onClose={() => setViewingEvent(null)} className="max-w-[560px] p-6">
        {viewingEvent && (
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-1.5">
                  {viewingEvent.eventType || "Google Calendar Event"}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {viewingEvent.eventTitle}
                </h3>
                {viewingEvent.courseName && (
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                    📚 {viewingEvent.courseName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between rounded-lg bg-gray-50 px-3.5 py-2 dark:bg-gray-800/50">
                <span className="text-gray-500 dark:text-gray-400">Event ID:</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                  {viewingEvent.eventId || viewingEvent.googleEventId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="block text-gray-500 dark:text-gray-400 mb-0.5 font-medium">Start</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingEvent.startDateTime}</span>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
                  <span className="block text-gray-500 dark:text-gray-400 mb-0.5 font-medium">End</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingEvent.endDateTime}</span>
                </div>
              </div>

              {viewingEvent.description && (
                <div className="rounded-xl border border-gray-100 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-900">
                  <span className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Event Description / Notes:
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {viewingEvent.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setViewingEvent(null)}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
