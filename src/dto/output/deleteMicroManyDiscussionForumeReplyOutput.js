/**
 * OUTPUT PARAMETER FILE: Delete Micro Many Discussion Forum Reply Output DTO Parser
 * Parses response data for DeleteMicroManyDiscussionForumeReply POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO
 */
export function parseDeleteMicroManyDiscussionForumeReplyOutput(rawJson = {}, status = 200) {
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

export function parseDeleteMicroManyDiscussionForumeReplyErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to delete discussion forum reply',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        rawData: rawJson
    };
}
