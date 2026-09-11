/**
 * OUTPUT PARAMETER FILE: Get Micro Course Learn Data Output DTO Parser
 * Parses response data for GetMicroCourseLearnData POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with microCourseLearnDataList
 */
export function parseGetMicroCourseLearnDataOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.microCourseLearnDataList || rawJson?.MicroCourseLearnDataList || [];

    const microCourseLearnDataList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microCourseLearnId: item?.microCourseLearnId ?? item?.MicroCourseLearnId ?? 0,
            microCourseLearn: item?.microCourseLearn || item?.MicroCourseLearn || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        microCourseLearnDataList,
        rawData: rawJson
    };
}

export function parseGetMicroCourseLearnDataErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get micro course learn data',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        microCourseLearnDataList: [],
        rawData: rawJson
    };
}
