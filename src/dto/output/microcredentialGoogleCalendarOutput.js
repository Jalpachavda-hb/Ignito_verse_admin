/**
 * Output parsers for Microcredential Google Calendar Event API
 */

export function parseCreateMicrocredentialGoogleCalendarEventOutput(data, status = 200) {
  return {
    isSuccess: data?.isSuccess ?? (status >= 200 && status < 300),
    message: data?.message || "Event created successfully.",
    notificationMessage: data?.notificationMessage || "",
    studentFcmTokens: data?.studentFcmTokens || [],
    status,
    rawData: data,
  };
}

export function parseCreateMicrocredentialGoogleCalendarEventErrorOutput(data, status = 500) {
  return {
    isSuccess: false,
    message: data?.message || data?.title || "Failed to create Google Calendar event.",
    status,
    rawData: data,
  };
}

export function parseGetMicrocredentialGoogleCalendarEventListOutput(data, status = 200) {
  return {
    isSuccess: data?.isSuccess ?? true,
    message: data?.message || null,
    googleCalenderEventList: data?.googleCalenderEventList || [],
    pageDetail: data?.pageDetail || {
      totalRecords: 0,
      pageSize: 10,
      pageNo: 1,
      orderByColumn: "GoogleEventId",
      orderByDirection: "DESC",
    },
    status,
    rawData: data,
  };
}

export function parseGetMicrocredentialGoogleCalendarEventListErrorOutput(data, status = 500) {
  return {
    isSuccess: false,
    message: data?.message || data?.title || "Failed to fetch Google Calendar event list.",
    googleCalenderEventList: [],
    pageDetail: {
      totalRecords: 0,
      pageSize: 10,
      pageNo: 1,
    },
    status,
    rawData: data,
  };
}
