import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import {
  CopyIcon,
  CheckCircleIcon,
  CloseIcon,
  PlusIcon,
  VideoIcon,
} from "../../icons";
import { getZoomMeetingList } from "../../services/microcredentialZoomService";

export default function ZoomMeetingList() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Sorting state
  const [sortField, setSortField] = useState("CreateMeetingZoomId");
  const [sortAsc, setSortAsc] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Fetch Zoom Meeting List from API
  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getZoomMeetingList({
        pageNo: currentPage,
        pageSize: pageSize,
        orderByColumn: sortField,
        orderByDirection: sortAsc ? "ASC" : "DESC",
        searchInput: searchTerm,
      });

      if (res?.isSuccess && Array.isArray(res?.zoomMeetingOutputList)) {
        setMeetings(res.zoomMeetingOutputList);
        if (res?.pageDetail?.totalRecords !== undefined) {
          setTotalRecords(res.pageDetail.totalRecords);
        } else {
          setTotalRecords(res.zoomMeetingOutputList.length);
        }
      } else if (Array.isArray(res?.data)) {
        setMeetings(res.data);
        setTotalRecords(res.data.length);
      } else {
        setMeetings([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error("Failed to fetch Zoom meetings:", err);
      showToast("Error loading Zoom meetings from server");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortAsc, searchTerm]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Client Filter Search fallback if needed
  const filteredMeetings = useMemo(() => {
    if (!searchTerm.trim()) return meetings;
    const q = searchTerm.toLowerCase();
    return meetings.filter(
      (m) =>
        (m.courseName && m.courseName.toLowerCase().includes(q)) ||
        (m.programmeName && m.programmeName.toLowerCase().includes(q)) ||
        (m.meetingName && m.meetingName.toLowerCase().includes(q)) ||
        (m.meetingId && m.meetingId.toLowerCase().includes(q)) ||
        (m.meetingType && m.meetingType.toLowerCase().includes(q))
    );
  }, [meetings, searchTerm]);

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <>
      <PageMeta
        title="Zoom Meeting List | Ignito Verse Admin"
        description="Schedule, manage and start Zoom online meetings with real-time sync."
      />

      <PageBreadcrumb pageTitle="Zoom Meeting List" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircleIcon className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Zoom Meeting List</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live Zoom conferences scheduled for enrolled microcredential students.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/create-zoom-meeting")}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-theme-xs hover:bg-brand-600 transition cursor-pointer"
          >
            <PlusIcon className="size-4" />
            <span>Create Zoom Meeting</span>
          </button>
        </div>

        {/* Filters & Search Bar */}
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
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-3.5 pr-8 text-xs text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
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
              <tr className="border-b border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40 text-[11px] font-bold tracking-wider text-gray-700 dark:text-gray-200">
                <th
                  onClick={() => handleSort("courseName")}
                  className="px-4 py-3.5 cursor-pointer hover:text-brand-500 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Programme Details</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("isPrivate")}
                  className="px-3 py-3.5 text-center cursor-pointer hover:text-brand-500 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Private</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("meetingName")}
                  className="px-4 py-3.5 cursor-pointer hover:text-brand-500 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Meetings Details</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("duration")}
                  className="px-4 py-3.5 text-center cursor-pointer hover:text-brand-500 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Duration In Minutes</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("meetingDateAndTime")}
                  className="px-4 py-3.5 cursor-pointer hover:text-brand-500 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Meeting Date &amp; Time</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center select-none">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Join Meeting</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center select-none">
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Start Meeting</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("meetingType")}
                  className="px-4 py-3.5 text-center cursor-pointer hover:text-brand-500 transition select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Meeting Type</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("updatedOn")}
                  className="px-4 py-3.5 cursor-pointer hover:text-brand-500 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Updated On</span>
                    <span className="text-gray-400">⇅</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                      <span>Loading Zoom meetings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-gray-400 dark:text-gray-500 font-medium">
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((meet) => {
                  const isPrivate = meet.isPrivate === true || meet.isPrivate === "True";

                  return (
                    <tr
                      key={meet.createMeetingZoomId || meet.meetingId}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Programme Details */}
                      <td className="px-4 py-4 max-w-[240px]">
                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {meet.courseName || meet.programmeName || "Microcredential Course"}
                        </div>
                        {meet.programmeType && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {meet.programmeType}
                          </div>
                        )}
                      </td>

                      {/* Private */}
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

                      {/* Meetings Details */}
                      <td className="px-4 py-4 max-w-[220px]">
                        <div className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {meet.meetingName}
                        </div>
                        {meet.meetingId && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                            <span>ID: {meet.meetingId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(meet.meetingId, "Meeting ID")}
                              title="Copy Meeting ID"
                              className="text-gray-400 hover:text-brand-500 cursor-pointer"
                            >
                              <CopyIcon className="size-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Duration In Minutes */}
                      <td className="px-4 py-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                        {meet.duration} Min
                      </td>

                      {/* Meeting Date & Time */}
                      <td className="px-4 py-4 text-gray-800 dark:text-gray-200 whitespace-nowrap font-medium text-[11px]">
                        {meet.meetingDateAndTime}
                      </td>

                      {/* Join Meeting */}
                      <td className="px-4 py-4 text-center">
                        {meet.joinMeetingURL ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <a
                              href={meet.joinMeetingURL}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-300 transition"
                            >
                              <VideoIcon className="size-3.5" />
                              <span>Join</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(meet.joinMeetingURL, "Join Link")}
                              title="Copy Join Link"
                              className="inline-flex size-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 cursor-pointer transition"
                            >
                              <CopyIcon className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Start Meeting */}
                      <td className="px-4 py-4 text-center">
                        {meet.startMeetingURL ? (
                          <a
                            href={meet.startMeetingURL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                          >
                            <span>Start</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Meeting Type */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 whitespace-nowrap">
                          {meet.meetingType || "scheduled"}
                        </span>
                      </td>

                      {/* Updated On */}
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[11px]">
                        {meet.updatedOn}
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
    </>
  );
}
