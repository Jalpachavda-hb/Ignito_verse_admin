/**
 * OUTPUT PARAMETER FILE: Admin Get Micro Course Many Discussion Forum Questions List Output DTO Parser
 * Parses response data for AdminGetMicroCourseManyDiscussionForumQuestionsList POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with discussionQuestionList and pageDetail
 */
export function parseAdminGetMicroCourseManyDiscussionForumQuestionsListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.discussionQuestionList || rawJson?.DiscussionQuestionList || [];

    const discussionQuestionList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microCourseDiscussionQuestionId: item?.microCourseDiscussionQuestionId ?? item?.MicroCourseDiscussionQuestionId ?? 0,
            questionProfessorId: item?.questionProfessorId ?? item?.QuestionProfessorId ?? 0,
            questionStudentId: item?.questionStudentId ?? item?.QuestionStudentId ?? 0,
            microCorseId: item?.microCorseId ?? item?.MicroCorseId ?? item?.microCourseId ?? item?.MicroCourseId ?? 0,
            question: item?.question || item?.Question || '',
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            questionAskedByStudent: item?.questionAskedByStudent || item?.QuestionAskedByStudent || '',
            questionAskedByProfessor: item?.questionAskedByProfessor || item?.QuestionAskedByProfessor || '',
            createdOn: item?.createdOn || item?.CreatedOn || ''
        }))
        : [];

    const rawPageDetail = rawJson?.pageDetail || rawJson?.PageDetail || {};
    const pageDetail = {
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10,
        orderByColumn: rawPageDetail?.orderByColumn || rawPageDetail?.OrderByColumn || 'CreatedOn',
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
        discussionQuestionList,
        pageDetail,
        rawData: rawJson
    };
}

export function parseAdminGetMicroCourseManyDiscussionForumQuestionsListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get discussion forum questions list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        discussionQuestionList: [],
        pageDetail: {
            pageNo: 1,
            pageSize: 10,
            orderByColumn: 'CreatedOn',
            orderByDirection: 'DESC',
            totalRecords: 0,
            adminId: 0,
            searchInput: ''
        },
        rawData: rawJson
    };
}
