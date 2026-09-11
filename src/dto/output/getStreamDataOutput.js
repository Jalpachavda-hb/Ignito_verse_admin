/**
 * OUTPUT PARAMETER FILE: Get Stream Data Output DTO Parser
 * Parses response data for GetStreamData POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with streamDataList
 */
export function parseGetStreamDataOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.streamDataList || rawJson?.StreamDataList || [];

    const streamDataList = Array.isArray(rawList)
        ? rawList.map(item => ({
            streamId: item?.streamId ?? item?.StreamId ?? 0,
            streamName: item?.streamName || item?.StreamName || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        streamDataList,
        streams: streamDataList,
        rawData: rawJson
    };
}

export function parseGetStreamDataErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get stream data list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        streamDataList: [],
        rawData: rawJson
    };
}
