/**
 * INPUT PARAMETER FILE: Insert Micro Single Discussion Reply Input DTO Builder
 * Builds input parameter body for InsertMicroSingleDiscussionReply POST request.
 * 
 * @param {object} [data={}] - Object containing adminId, studentId, microSingleDiscussionQuestionId, reply, microCourseId
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildInsertMicroSingleDiscussionReplyInput(data = {}) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            adminId: Number(data?.adminId || data?.AdminId || 1),
            AdminId: Number(data?.adminId || data?.AdminId || 1),
            studentId: data?.studentId ?? data?.StudentId ?? 0,
            microSingleDiscussionQuestionId: data?.microSingleDiscussionQuestionId ?? data?.MicroSingleDiscussionQuestionId ?? 0,
            reply: data?.reply || data?.Reply || '',
            microCourseId: data?.microCourseId ?? data?.MicroCourseId ?? 0
        })
    };
}
