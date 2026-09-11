/**
 * OUTPUT PARAMETER FILE: Admin Get Micro Course Many Discussion Question Reply List Output DTO Parser
 * Parses response data for AdminGetMicroCourseManyDiscussionQuestionReplyList POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with getMicroCourseManyDiscussionQuestionReply
 */
export function parseAdminGetMicroCourseManyDiscussionQuestionReplyListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.getMicroCourseManyDiscussionQuestionReply || rawJson?.GetMicroCourseManyDiscussionQuestionReply || [];

    const getMicroCourseManyDiscussionQuestionReply = Array.isArray(rawList)
        ? rawList.map(item => ({
            microCourseDiscussionReplyId: item?.microCourseDiscussionReplyId ?? item?.MicroCourseDiscussionReplyId ?? 0,
            microCourseDiscussionQuestionId: item?.microCourseDiscussionQuestionId ?? item?.MicroCourseDiscussionQuestionId ?? 0,
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            professorId: item?.professorId ?? item?.ProfessorId ?? 0,
            reply: item?.reply || item?.Reply || '',
            repliedByStudent: item?.repliedByStudent || item?.RepliedByStudent || '',
            repliedByProfessor: item?.repliedByProfessor || item?.RepliedByProfessor || '',
            createdOn: item?.createdOn || item?.CreatedOn || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        getMicroCourseManyDiscussionQuestionReply,
        rawData: rawJson
    };
}

export function parseAdminGetMicroCourseManyDiscussionQuestionReplyListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get discussion question reply list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        getMicroCourseManyDiscussionQuestionReply: [],
        rawData: rawJson
    };
}
