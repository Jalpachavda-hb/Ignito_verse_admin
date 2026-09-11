/**
 * INPUT PARAMETER FILE: Microcredential Student Review Like Insert Input DTO Builder
 * Builds input parameter body for MicrocredentialStudentReviewLikeInsert POST request.
 * 
 * @param {number} microcredentialReviewId - Microcredential review identifier
 * @param {number} studentId - Student identifier
 * @param {number} microcredentialCourseId - Microcredential course identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialStudentReviewLikeInsertInput(
    microcredentialReviewId = 0,
    studentId = 0,
    microcredentialCourseId = 0
) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            microcredentialReviewId: microcredentialReviewId,
            studentId: studentId,
            microcredentialCourseId: microcredentialCourseId
        })
    };
}
