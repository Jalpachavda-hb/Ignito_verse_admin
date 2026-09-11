/**
 * OUTPUT PARAMETER FILE: Get Microcredential Course Level Output DTO Parser
 * Parses response data for GetMicroCredentialCourseLevel POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with microCredentialCourseLevelList
 */
export function parseGetMicroCredentialCourseLevelOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.microCredentialCourseLevelList || rawJson?.MicroCredentialCourseLevelList || [];

    const microCredentialCourseLevelList = Array.isArray(rawList)
        ? rawList.map(item => ({
            courseValue: item?.courseValue ?? item?.CourseValue ?? 0,
            courseLevel: item?.courseLevel || item?.CourseLevel || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        microCredentialCourseLevelList,
        rawData: rawJson
    };
}

export function parseGetMicroCredentialCourseLevelErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get microcredential course levels',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        microCredentialCourseLevelList: [],
        rawData: rawJson
    };
}
