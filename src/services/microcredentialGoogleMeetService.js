import { apiClient } from "./apiClient";

/**
 * Service for Microcredential Google Meet API integration
 * Base controller: /api/MicrocredentialGoogleMeetAPI
 */

/**
 * 1. Create or Update Microcredential Google Meet
 * Endpoint: POST /api/MicrocredentialGoogleMeetAPI/CreateGoogleMeet
 *
 * @param {Object} data
 * @param {number} [data.googleMeetMasterId=0] - 0 for new, existing ID for update
 * @param {number} data.microcredentialCourseId - Course ID
 * @param {number} [data.adminId=1] - Admin ID
 * @param {string|null} [data.eventId=null] - Google Calendar Event ID if updating
 * @param {string} data.summary - Meeting title / Summary
 * @param {string} data.description - Meeting agenda / description
 * @param {string} data.startDateTime - ISO start datetime (e.g. 2026-09-15T10:00:00)
 * @param {string} data.endDateTime - ISO end datetime (e.g. 2026-09-15T11:30:00)
 * @param {boolean} [data.isPrivateMeeting=false] - Is private meeting
 * @param {boolean} [data.isReminderSet=true] - Is reminder enabled
 * @returns {Promise<{ isSuccess: boolean, message: string, notificationMessage?: string, studentFcmTokens?: string[] }>}
 */
export async function createOrUpdateGoogleMeet(data) {
  try {
    const adminId = Number(localStorage.getItem("ignito_admin_id")) || data.adminId || 1;
    const payload = {
      googleMeetMasterId: Number(data.googleMeetMasterId) || 0,
      microcredentialCourseId: Number(data.microcredentialCourseId),
      adminId,
      eventId: data.eventId || null,
      summary: data.summary || data.meetTitle || "",
      description: data.description || "",
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      isPrivateMeeting: Boolean(data.isPrivateMeeting),
      isReminderSet: Boolean(data.isReminderSet),
    };

    const response = await apiClient("api/MicrocredentialGoogleMeetAPI/CreateGoogleMeet", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data || { isSuccess: false, message: "Unknown response from server" };
  } catch (error) {
    console.error("Error in createOrUpdateGoogleMeet:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to save Google Meet",
    };
  }
}

/**
 * 2. Get Google Meet Recording URL & Attendee RSVP Info
 * Endpoint: POST /api/MicrocredentialGoogleMeetAPI/GetGoogleMeetRecordingAndAttendeeInfo?eventId={eventId}
 *
 * @param {string} eventId - Google Calendar Event ID
 * @returns {Promise<Object>}
 */
export async function getGoogleMeetRecordingAndAttendeeInfo(eventId) {
  try {
    if (!eventId) {
      return { isSuccess: false, message: "Event ID is required" };
    }

    const response = await apiClient(
      `api/MicrocredentialGoogleMeetAPI/GetGoogleMeetRecordingAndAttendeeInfo?eventId=${encodeURIComponent(
        eventId
      )}`,
      {
        method: "POST",
      }
    );

    return response.data || { isSuccess: false, message: "Failed to fetch recording info" };
  } catch (error) {
    console.error("Error in getGoogleMeetRecordingAndAttendeeInfo:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to fetch recording info",
    };
  }
}

/**
 * 3. Get Microcredential Google Meet List (Paginated)
 * Endpoint: POST /api/MicrocredentialGoogleMeetAPI/GetGoogleMeetList
 *
 * @param {Object} [params]
 * @param {number} [params.adminId=1]
 * @param {number} [params.pageNo=1]
 * @param {number} [params.pageSize=10]
 * @param {string} [params.orderByColumn="CreatedOn"]
 * @param {string} [params.orderByDirection="DESC"]
 * @returns {Promise<{ isSuccess: boolean, pageDetail?: Object, googleMeetList?: Array }>}
 */
export async function getGoogleMeetList({
  adminId = 1,
  pageNo = 1,
  pageSize = 10,
  orderByColumn = "CreatedOn",
  orderByDirection = "DESC",
} = {}) {
  try {
    const currentAdminId = Number(localStorage.getItem("ignito_admin_id")) || adminId || 1;
    const payload = {
      adminId: currentAdminId,
      pageNo: Number(pageNo) || 1,
      pageSize: Number(pageSize) || 10,
      orderByColumn: orderByColumn || "CreatedOn",
      orderByDirection: orderByDirection || "DESC",
    };

    const response = await apiClient("api/MicrocredentialGoogleMeetAPI/GetGoogleMeetList", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data || { isSuccess: false, googleMeetList: [] };
  } catch (error) {
    console.error("Error in getGoogleMeetList:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to fetch Google Meet list",
      googleMeetList: [],
    };
  }
}

/**
 * 4. Get Microcredential Google Meet by ID
 * Endpoint: POST /api/MicrocredentialGoogleMeetAPI/GetGoogleMeetById?GoogleMeetMasterId={id}
 *
 * @param {number|string} googleMeetMasterId
 * @returns {Promise<Object>}
 */
export async function getGoogleMeetById(googleMeetMasterId) {
  try {
    const response = await apiClient(
      `api/MicrocredentialGoogleMeetAPI/GetGoogleMeetById?GoogleMeetMasterId=${encodeURIComponent(
        googleMeetMasterId
      )}`,
      {
        method: "POST",
      }
    );

    return response.data || { isSuccess: false, message: "Failed to fetch meeting details" };
  } catch (error) {
    console.error("Error in getGoogleMeetById:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to fetch meeting details",
    };
  }
}

/**
 * 5. Delete / Cancel Microcredential Google Meet
 * Endpoint: POST /api/MicrocredentialGoogleMeetAPI/DeleteGoogleMeetById
 *
 * @param {Object} params
 * @param {number|string} params.googleMeetMasterId
 * @param {string} [params.eventId]
 * @param {number} [params.adminId=1]
 * @returns {Promise<{ isSuccess: boolean, message?: string }>}
 */
export async function deleteGoogleMeetById({ googleMeetMasterId, eventId, adminId = 1 }) {
  try {
    const currentAdminId = Number(localStorage.getItem("ignito_admin_id")) || adminId || 1;
    const payload = {
      adminId: currentAdminId,
      googleMeetMasterId: Number(googleMeetMasterId),
      eventId: eventId || "",
    };

    const response = await apiClient("api/MicrocredentialGoogleMeetAPI/DeleteGoogleMeetById", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data || { isSuccess: false };
  } catch (error) {
    console.error("Error in deleteGoogleMeetById:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to delete meeting",
    };
  }
}

/**
 * 6. Get Microcredential Google Meet Attendees
 * Endpoint: POST /api/MicrocredentialGoogleMeetAPI/GetGoogleMeetAttendees
 *
 * @param {number|string} googleMeetMasterId
 * @returns {Promise<{ isSuccess: boolean, meetAttendees?: Array }>}
 */
export async function getGoogleMeetAttendees(googleMeetMasterId) {
  try {
    const payload = {
      googleMeetMasterId: Number(googleMeetMasterId),
    };

    const response = await apiClient("api/MicrocredentialGoogleMeetAPI/GetGoogleMeetAttendees", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data || { isSuccess: false, meetAttendees: [] };
  } catch (error) {
    console.error("Error in getGoogleMeetAttendees:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to fetch attendees",
      meetAttendees: [],
    };
  }
}
