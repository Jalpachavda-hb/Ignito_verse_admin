/**
 * OUTPUT PARAMETER FILE: Micro Course Topic Add/Update Output DTO Parser
 * Parses response data for MicroCourseTopicAddUpdate POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with Firebase notification details
 */
export function parseMicroCourseTopicAddUpdateOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        studentFcmToken: rawJson?.studentFcmToken || rawJson?.StudentFcmToken || null,
        studentFcmTokens: rawJson?.studentFcmTokens || rawJson?.StudentFcmTokens || [],
        notificationMessage: rawJson?.notificationMessage || rawJson?.NotificationMessage || null,
        rawData: rawJson
    };
}

export function parseMicroCourseTopicAddUpdateErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to add/update micro course topics',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        studentFcmToken: null,
        studentFcmTokens: [],
        notificationMessage: null,
        rawData: rawJson
    };
}
