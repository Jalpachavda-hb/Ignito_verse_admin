/**
 * OUTPUT PARAMETER FILE: Get Microcredential Single Discussion Question List Output DTO Parser
 * Parses response data for GetMicrocredentialSingleDiscussionQuestionList POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with getMicrocredentialSingleDiscussionQuestionList and pageDetail
 */
export function parseGetMicrocredentialSingleDiscussionQuestionListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.getMicrocredentialSingleDiscussionQuestionList || rawJson?.GetMicrocredentialSingleDiscussionQuestionList || [];

    const getMicrocredentialSingleDiscussionQuestionList = Array.isArray(rawList)
        ? rawList.map(item => ({
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            microCourseId: item?.microCourseId ?? item?.MicroCourseId ?? item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            questionAskedByStudent: item?.questionAskedByStudent || item?.QuestionAskedByStudent || ''
        }))
        : [];

    const rawPageDetail = rawJson?.pageDetail || rawJson?.PageDetail || {};
    const pageDetail = {
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10,
        orderByColumn: rawPageDetail?.orderByColumn || rawPageDetail?.OrderByColumn || 'MicroCourseId',
        orderByDirection: rawPageDetail?.orderByDirection || rawPageDetail?.OrderByDirection || 'DESC',
        totalRecords: rawPageDetail?.totalRecords ?? rawPageDetail?.TotalRecords ?? 0,
        adminId: rawPageDetail?.adminId ?? rawPageDetail?.AdminId ?? 0,
        searchInput: rawPageDetail?.searchInput || rawPageDetail?.SearchInput || ''
    };

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        getMicrocredentialSingleDiscussionQuestionList,
        pageDetail,
        rawData: rawJson
    };
}

export function parseGetMicrocredentialSingleDiscussionQuestionListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get single discussion question list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        getMicrocredentialSingleDiscussionQuestionList: [],
        pageDetail: {
            pageNo: 1,
            pageSize: 10,
            orderByColumn: 'MicroCourseId',
            orderByDirection: 'DESC',
            totalRecords: 0,
            adminId: 0,
            searchInput: ''
        },
        rawData: rawJson
    };
}
