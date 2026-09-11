/**
 * INPUT PARAMETER FILE: Admin Get Micro Course Many Discussion Question Reply List Input DTO Builder
 * Builds input parameter body for AdminGetMicroCourseManyDiscussionQuestionReplyList POST request.
 * 
 * @param {number} [discussionQuestionId=0] - Discussion question ID
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildAdminGetMicroCourseManyDiscussionQuestionReplyListInput(discussionQuestionId = 0) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            DiscussionQuestionId: Number(discussionQuestionId),
            discussionQuestionId: Number(discussionQuestionId)
        })
    };
}
