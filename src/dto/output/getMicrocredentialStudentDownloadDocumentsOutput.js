/**
 * OUTPUT PARAMETER FILE: Get Microcredential Student Download Documents Output DTO Parser
 * Parses response data for GetMicrocredentialStudentDownloadDocuments POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with adminGetMicrocredentialStudentDownloadDocumentsData
 */
export function parseGetMicrocredentialStudentDownloadDocumentsOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.adminGetMicrocredentialStudentDownloadDocumentsData || rawJson?.AdminGetMicrocredentialStudentDownloadDocumentsData || [];

    const adminGetMicrocredentialStudentDownloadDocumentsData = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialStudentDownloadDocumentId: item?.microcredentialStudentDownloadDocumentId ?? item?.MicrocredentialStudentDownloadDocumentId ?? 0,
            microcredentialStudentDownloadDocument: item?.microcredentialStudentDownloadDocument || item?.MicrocredentialStudentDownloadDocument || '',
            originalFileName: item?.originalFileName || item?.OriginalFileName || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        adminGetMicrocredentialStudentDownloadDocumentsData,
        rawData: rawJson
    };
}

export function parseGetMicrocredentialStudentDownloadDocumentsErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get student download documents',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        adminGetMicrocredentialStudentDownloadDocumentsData: [],
        rawData: rawJson
    };
}
