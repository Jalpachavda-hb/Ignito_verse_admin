import React from "react";
import { Link } from "react-router";
import { ZoomMeetingIcon, DesktopMonitorIcon, GoogleGIcon } from "../../icons/menuIcons";
import { CalenderIcon } from "../../icons";

interface MeetingItem {
  id?: string | number;
  type: "zoom" | "google_meet";
  title: string;
  dateTime: string;
  duration?: number | string;
  joinUrl?: string;
}

interface UpcomingSessionsCardProps {
  zoomMeetings: any[];
  googleMeets: any[];
  loading: boolean;
}

export const UpcomingSessionsCard: React.FC<UpcomingSessionsCardProps> = ({
  zoomMeetings,
  googleMeets,
  loading,
}) => {
  // Combine & normalize meetings
  const allSessions: MeetingItem[] = [
    ...zoomMeetings.map((z, idx) => ({
      id: z.createMeetingZoomId || z.zoomMeetingId || `zoom-${idx}`,
      type: "zoom" as const,
      title: z.meetingName || "Zoom Live Classroom",
      dateTime: z.meetingDateAndTime || z.createdOn || "",
      duration: z.duration ? `${z.duration} mins` : "60 mins",
      joinUrl: z.joinUrl || z.startUrl || "",
    })),
    ...googleMeets.map((g, idx) => ({
      id: g.googleMeetMasterId || g.eventId || `meet-${idx}`,
      type: "google_meet" as const,
      title: g.meetingName || g.eventTitle || "Google Meet Session",
      dateTime: g.meetingDateAndTime || g.createdOn || "",
      duration: g.duration ? `${g.duration} mins` : "45 mins",
      joinUrl: g.meetLink || g.hangoutLink || "",
    })),
  ];

  // Sort by date descending or take first 5
  const displaySessions = allSessions.slice(0, 5);

  const formatSessionTime = (dateStr: string) => {
    if (!dateStr) return "Scheduled";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Upcoming Live Sessions
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Live lectures & interactive classrooms
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to="/zoom-meeting-list"
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Zoom
            </Link>
            <Link
              to="/google-meet-list"
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              Meet
            </Link>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800"></div>
                </div>
              </div>
            ))
          ) : displaySessions.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <CalenderIcon className="h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-2 text-xs font-medium">No live sessions scheduled</p>
              <div className="mt-2 flex justify-center gap-2">
                <Link
                  to="/zoom-meeting-list"
                  className="text-xs font-semibold text-brand-500 hover:underline"
                >
                  + New Zoom
                </Link>
                <span className="text-xs text-gray-300">·</span>
                <Link
                  to="/google-meet-list"
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  + New Meet
                </Link>
              </div>
            </div>
          ) : (
            displaySessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100/60 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:bg-gray-800/80"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                      session.type === "zoom"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                        : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                    }`}
                  >
                    {session.type === "zoom" ? (
                      <ZoomMeetingIcon className="h-5 w-5" />
                    ) : (
                      <DesktopMonitorIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {session.title}
                    </h4>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatSessionTime(session.dateTime)}</span>
                      <span>·</span>
                      <span>{session.duration}</span>
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0 pl-2">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      session.type === "zoom"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    }`}
                  >
                    {session.type === "zoom" ? "Zoom" : "Meet"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3 text-center dark:border-gray-800/80">
        <Link
          to="/google-calender-list"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <GoogleGIcon className="h-3.5 w-3.5" />
          <span>Open Google Calendar Planner</span>
        </Link>
      </div>
    </div>
  );
};

export default UpcomingSessionsCard;
