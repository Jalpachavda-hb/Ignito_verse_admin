/**
 * OUTPUT PARAMETER FILE: Microcredential Course Delete Output DTO Parser
 * Parses response data for MicrocredentialCourseDelete POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO
 */
export function parseMicrocredentialCourseDeleteOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        rawData: rawJson
    };
}

export function parseMicrocredentialCourseDeleteErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to delete microcredential course',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        rawData: rawJson
    };
}
