/**
 * INPUT PARAMETER FILE: Delete Microcredential Student Review Input DTO Builder
 * Builds input parameter body for DeleteMicrocredentialStudentReview POST request.
 * 
 * @param {number} [microcredentialCourseReviewId=0] - Microcredential course review ID
 * @param {number} [adminId=0] - Admin identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildDeleteMicrocredentialStudentReviewInput(
    microcredentialCourseReviewId = 0,
    adminId = 1
) {
    const cleanAdminId = Number(adminId || 1);
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            microcredentialCourseReviewId: microcredentialCourseReviewId,
            adminId: cleanAdminId,
            AdminId: cleanAdminId
        })
    };
}
