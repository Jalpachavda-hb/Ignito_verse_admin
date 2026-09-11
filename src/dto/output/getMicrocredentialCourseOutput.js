/**
 * OUTPUT PARAMETER FILE: Get Microcredential Course Output DTO Parser
 * Parses response data for GetMicrocredentialCourse POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with microcredentialCourseOutputList
 */
export function parseGetMicrocredentialCourseOutput(rawJson = {}, status = 200) {
    if (typeof rawJson === 'string') {
        try {
            rawJson = JSON.parse(rawJson);
        } catch (e) {
            console.warn('Failed to parse rawJson in parseGetMicrocredentialCourseOutput:', e);
            rawJson = {};
        }
    }

    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList =
        rawJson?.microcredentialCourseOutputList ||
        rawJson?.MicrocredentialCourseOutputList ||
        rawJson?.data?.microcredentialCourseOutputList ||
        rawJson?.data?.MicrocredentialCourseOutputList ||
        rawJson?.data ||
        rawJson?.microcredentialCourseList ||
        rawJson?.MicrocredentialCourseList ||
        rawJson?.microCourseList ||
        rawJson?.MicroCourseList ||
        rawJson?.courseList ||
        rawJson?.CourseList ||
        (Array.isArray(rawJson) ? rawJson : []);

    const microcredentialCourseOutputList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialCourseId:
                item?.microcredentialCourseId ??
                item?.MicrocredentialCourseId ??
                item?.courseId ??
                item?.CourseId ??
                item?.id ??
                0,
            microcredentialCourseName:
                item?.microcredentialCourseName ||
                item?.MicrocredentialCourseName ||
                item?.courseName ||
                item?.CourseName ||
                item?.name ||
                ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        microcredentialCourseOutputList,
        rawData: rawJson
    };
}

export function parseGetMicrocredentialCourseErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get microcredential course list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        microcredentialCourseOutputList: [],
        rawData: rawJson
    };
}
