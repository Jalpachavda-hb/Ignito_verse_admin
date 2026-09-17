/**
 * DTO builders for Microcredential Google Calendar Event API
 */

export function buildCreateMicrocredentialGoogleCalendarEventInput({
  adminId = 1,
  microcredentialCourseId,
  eventTitle,
  startDateTime,
  endDateTime,
  eventType = "Live Workshop",
  description = "",
} = {}) {
  const currentAdminId = Number(localStorage.getItem("ignito_admin_id")) || adminId || 1;
  return {
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      adminId: currentAdminId,
      microcredentialCourseId: Number(microcredentialCourseId),
      eventTitle: eventTitle || "",
      startDateTime: startDateTime || "",
      endDateTime: endDateTime || "",
      eventType: eventType || "Live Workshop",
      description: description || "",
    }),
  };
}

export function buildGetMicrocredentialGoogleCalendarEventListInput({
  adminId = 1,
  pageNo = 1,
  pageSize = 10,
  orderByColumn = "GoogleEventId",
  orderByDirection = "DESC",
  searchInput = "",
} = {}) {
  const currentAdminId = Number(localStorage.getItem("ignito_admin_id")) || adminId || 1;
  return {
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      adminId: currentAdminId,
      pageNo: Number(pageNo) || 1,
      pageSize: Number(pageSize) || 10,
      orderByColumn: orderByColumn || "GoogleEventId",
      orderByDirection: orderByDirection || "DESC",
      searchInput: searchInput || "",
    }),
  };
}
