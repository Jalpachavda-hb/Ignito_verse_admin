/**
 * INPUT PARAMETER FILE: Delete Micro Many Discussion Forum Questions Input DTO Builder
 * Builds input parameter body for DeleteMicroManyDiscussionForumQuestions POST request.
 * 
 * @param {number} [microCourseDiscussionQuestionId=0] - Micro course discussion question ID
 * @param {number} [adminId=0] - Admin identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildDeleteMicroManyDiscussionForumQuestionsInput(
    microCourseDiscussionQuestionId = 0,
    adminId = 1
) {
    const cleanAdminId = Number(adminId || 1);
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicroCourseDiscussionQuestionId: Number(microCourseDiscussionQuestionId),
            microCourseDiscussionQuestionId: Number(microCourseDiscussionQuestionId),
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}
