import { apiClient } from "./apiClient";
import {
  buildCreateMicrocredentialGoogleCalendarEventInput,
  buildGetMicrocredentialGoogleCalendarEventListInput,
} from "../dto/input/microcredentialGoogleCalendarInput";
import {
  parseCreateMicrocredentialGoogleCalendarEventOutput,
  parseCreateMicrocredentialGoogleCalendarEventErrorOutput,
  parseGetMicrocredentialGoogleCalendarEventListOutput,
  parseGetMicrocredentialGoogleCalendarEventListErrorOutput,
} from "../dto/output/microcredentialGoogleCalendarOutput";

/**
 * Service for Microcredential Google Calendar Event API integration
 * Controller: /api/MicrocredentialGoogleCalendarAPI
 */

/**
 * 1. Create Microcredential Google Calendar Event
 * Endpoint: POST /api/MicrocredentialGoogleCalendarAPI/CreateEvent
 *
 * @param {Object} data
 * @param {number} [data.adminId=1]
 * @param {number} data.microcredentialCourseId
 * @param {string} data.eventTitle
 * @param {string} data.startDateTime - Format: YYYY-MM-DDTHH:mm or ISO string
 * @param {string} data.endDateTime - Format: YYYY-MM-DDTHH:mm or ISO string
 * @param {string} [data.eventType="Live Workshop"]
 * @param {string} [data.description=""]
 * @returns {Promise<{ isSuccess: boolean, message: string, notificationMessage?: string, studentFcmTokens?: string[] }>}
 */
export async function createGoogleCalendarEvent(data) {
  try {
    const inputDto = buildCreateMicrocredentialGoogleCalendarEventInput(data);
    const response = await apiClient("api/MicrocredentialGoogleCalendarAPI/CreateEvent", {
      method: "POST",
      headers: inputDto.headers,
      body: inputDto.body,
    });

    if (!response.ok && response.status !== 200) {
      return parseCreateMicrocredentialGoogleCalendarEventErrorOutput(response.data, response.status);
    }

    return parseCreateMicrocredentialGoogleCalendarEventOutput(response.data, response.status);
  } catch (error) {
    console.error("Error in createGoogleCalendarEvent:", error);
    return parseCreateMicrocredentialGoogleCalendarEventErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 2. Get Microcredential Google Calendar Event List
 * Endpoint: POST /api/MicrocredentialGoogleCalendarAPI/GetEventList
 *
 * @param {Object} [params]
 * @param {number} [params.adminId=1]
 * @param {number} [params.pageNo=1]
 * @param {number} [params.pageSize=10]
 * @param {string} [params.orderByColumn="GoogleEventId"]
 * @param {string} [params.orderByDirection="DESC"]
 * @param {string} [params.searchInput=""]
 * @returns {Promise<{
 *   isSuccess: boolean,
 *   message?: string | null,
 *   googleCalenderEventList: Array<{
 *     googleEventId: number,
 *     eventId: string,
 *     programmeType: string,
 *     programmeName: string,
 *     semesterNumber: string,
 *     courseName: string,
 *     eventTitle: string,
 *     startDateTime: string,
 *     endDateTime: string,
 *     eventType: string,
 *     description: string,
 *     updatedOn: string
 *   }>,
 *   pageDetail?: {
 *     totalRecords: number,
 *     pageSize: number,
 *     pageNo: number,
 *     orderByColumn: string,
 *     orderByDirection: string
 *   }
 * }>}
 */
export async function getGoogleCalendarEventList(params = {}) {
  try {
    const inputDto = buildGetMicrocredentialGoogleCalendarEventListInput(params);
    const response = await apiClient("api/MicrocredentialGoogleCalendarAPI/GetEventList", {
      method: "POST",
      headers: inputDto.headers,
      body: inputDto.body,
    });

    if (!response.ok && response.status !== 200) {
      return parseGetMicrocredentialGoogleCalendarEventListErrorOutput(response.data, response.status);
    }

    return parseGetMicrocredentialGoogleCalendarEventListOutput(response.data, response.status);
  } catch (error) {
    console.error("Error in getGoogleCalendarEventList:", error);
    return parseGetMicrocredentialGoogleCalendarEventListErrorOutput({ message: error.message }, 500);
  }
}
