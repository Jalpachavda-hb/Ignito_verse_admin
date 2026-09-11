/**
 * INPUT PARAMETER FILE: Delete Micro Many Discussion Forum Reply Input DTO Builder
 * Builds input parameter body for DeleteMicroManyDiscussionForumeReply POST request.
 * 
 * @param {number} [microCourseDiscussionReplyId=0] - Micro course discussion reply ID
 * @param {number} [adminId=0] - Admin identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildDeleteMicroManyDiscussionForumeReplyInput(
    microCourseDiscussionReplyId = 0,
    adminId = 1
) {
    const cleanAdminId = Number(adminId || 1);
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicroCourseDiscussionReplyId: Number(microCourseDiscussionReplyId),
            microCourseDiscussionReplyId: Number(microCourseDiscussionReplyId),
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}
