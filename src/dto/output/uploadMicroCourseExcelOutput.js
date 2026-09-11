/**
 * OUTPUT PARAMETER FILE: Upload Micro Course Excel Output DTO Parser
 * Parses response data for UploadMicroCourseExcel POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with parsed Excel data lists
 */
export function parseUploadMicroCourseExcelOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const microCourseExcelDataList = rawJson?.microCourseExcelDataList || rawJson?.MicroCourseExcelDataList || [];
    const microCourseLearnList = rawJson?.microCourseLearnList || rawJson?.MicroCourseLearnList || [];
    const materialIncludeList = rawJson?.materialIncludeList || rawJson?.MaterialIncludeList || [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        microCourseExcelDataList,
        microCourseLearnList,
        materialIncludeList,
        rawData: rawJson
    };
}

export function parseUploadMicroCourseExcelErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to upload/process Excel file',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        microCourseExcelDataList: [],
        microCourseLearnList: [],
        materialIncludeList: [],
        rawData: rawJson
    };
}
