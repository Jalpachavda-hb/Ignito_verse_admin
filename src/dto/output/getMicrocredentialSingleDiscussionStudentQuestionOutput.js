/**
 * OUTPUT PARAMETER FILE: Get Microcredential Single Discussion Student Question Output DTO Parser
 * Parses response data for GetMicrocredentialSingleDiscussionStudentQuestion POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with getMicrocredentialSingleDiscussionStudentQuestionList
 */
export function parseGetMicrocredentialSingleDiscussionStudentQuestionOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.getMicrocredentialSingleDiscussionStudentQuestionList || rawJson?.GetMicrocredentialSingleDiscussionStudentQuestionList || [];

    const getMicrocredentialSingleDiscussionStudentQuestionList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microSingleDiscussionQuestionId: item?.microSingleDiscussionQuestionId ?? item?.MicroSingleDiscussionQuestionId ?? 0,
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            microCourseId: item?.microCourseId ?? item?.MicroCourseId ?? 0,
            question: item?.question || item?.Question || '',
            microStudentsendDocument: item?.microStudentsendDocument || item?.MicroStudentsendDocument || '',
            type: item?.type || item?.Type || '',
            createdOn: item?.createdOn || item?.CreatedOn || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        getMicrocredentialSingleDiscussionStudentQuestionList,
        rawData: rawJson
    };
}

export function parseGetMicrocredentialSingleDiscussionStudentQuestionErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get student discussion questions',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        getMicrocredentialSingleDiscussionStudentQuestionList: [],
        rawData: rawJson
    };
}
