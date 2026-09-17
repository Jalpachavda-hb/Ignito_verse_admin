import { apiClient } from "./apiClient";

/**
 * Service for Microcredential Zoom Meeting API integration
 * Controller: /api/MicrocredentialZoomAPI
 */

/**
 * 1. Create Microcredential Zoom Meeting
 * Endpoint: POST /api/MicrocredentialZoomAPI/CreateZoomMeeting
 *
 * @param {Object} data
 * @param {number} [data.adminId=1]
 * @param {number} data.microcredentialCourseId
 * @param {string} data.meetingName
 * @param {number} data.duration
 * @param {string} data.meetingDateAndTime - ISO string (e.g. 2026-09-15T10:30:00)
 * @param {string} [data.meetingType="scheduled"]
 * @param {boolean} [data.isPrivate=false]
 * @returns {Promise<{ isSuccess: boolean, message: string, notificationMessage?: string, studentFcmTokens?: string[] }>}
 */
export async function createZoomMeeting(data) {
  try {
    const adminId = Number(localStorage.getItem("ignito_admin_id")) || data.adminId || 1;
    const payload = {
      adminId,
      microcredentialCourseId: Number(data.microcredentialCourseId),
      meetingName: data.meetingName,
      duration: Number(data.duration) || 60,
      meetingDateAndTime: data.meetingDateAndTime,
      meetingType: data.meetingType || "scheduled",
      isPrivate: Boolean(data.isPrivate),
    };

    const response = await apiClient("api/MicrocredentialZoomAPI/CreateZoomMeeting", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data || { isSuccess: false, message: "Unknown response from server" };
  } catch (error) {
    console.error("Error in createZoomMeeting:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to create Zoom meeting",
    };
  }
}

/**
 * 2. Get Microcredential Zoom Meeting List (Paginated)
 * Endpoint: POST /api/MicrocredentialZoomAPI/GetZoomMeetingList
 *
 * @param {Object} [params]
 * @param {number} [params.adminId=1]
 * @param {number} [params.pageNo=1]
 * @param {number} [params.pageSize=10]
 * @param {string} [params.orderByColumn="CreateMeetingZoomId"]
 * @param {string} [params.orderByDirection="DESC"]
 * @param {string} [params.searchInput=""]
 * @returns {Promise<{ isSuccess: boolean, pageDetail?: Object, zoomMeetingOutputList?: Array }>}
 */
export async function getZoomMeetingList({
  adminId = 1,
  pageNo = 1,
  pageSize = 10,
  orderByColumn = "CreateMeetingZoomId",
  orderByDirection = "DESC",
  searchInput = "",
} = {}) {
  try {
    const currentAdminId = Number(localStorage.getItem("ignito_admin_id")) || adminId || 1;
    const payload = {
      adminId: currentAdminId,
      pageNo: Number(pageNo) || 1,
      pageSize: Number(pageSize) || 10,
      orderByColumn: orderByColumn || "CreateMeetingZoomId",
      orderByDirection: orderByDirection || "DESC",
      searchInput: searchInput || "",
    };

    const response = await apiClient("api/MicrocredentialZoomAPI/GetZoomMeetingList", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response.data || { isSuccess: false, zoomMeetingOutputList: [] };
  } catch (error) {
    console.error("Error in getZoomMeetingList:", error);
    return {
      isSuccess: false,
      message: error?.message || "Failed to fetch Zoom meeting list",
      zoomMeetingOutputList: [],
    };
  }
}
