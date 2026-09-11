/**
 * OUTPUT PARAMETER FILE: Get Micro Course Material Include Data Output DTO Parser
 * Parses response data for GetMicroCourseMaterialIncludeData POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with microCourseMaterialIncludeDataList
 */
export function parseGetMicroCourseMaterialIncludeDataOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.microCourseMaterialIncludeDataList || rawJson?.MicroCourseMaterialIncludeDataList || [];

    const microCourseMaterialIncludeDataList = Array.isArray(rawList)
        ? rawList.map(item => ({
            materialIncludeId: item?.materialIncludeId ?? item?.MaterialIncludeId ?? 0,
            materialInclude: item?.materialInclude || item?.MaterialInclude || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        microCourseMaterialIncludeDataList,
        rawData: rawJson
    };
}

export function parseGetMicroCourseMaterialIncludeDataErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get micro course material include data',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        microCourseMaterialIncludeDataList: [],
        rawData: rawJson
    };
}
