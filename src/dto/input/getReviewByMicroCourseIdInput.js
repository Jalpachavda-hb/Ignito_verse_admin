/**
 * INPUT PARAMETER FILE: Get Review By Micro Course Id Input DTO Builder
 * Builds input parameter body for GetReviewByMicroCourseId POST request.
 * 
 * @param {number} microcredentialCourseId - Microcredential course identifier
 * @param {number} studentId - Student identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetReviewByMicroCourseIdInput(
    microcredentialCourseId = 0,
    studentId = 0
) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            microcredentialCourseId: microcredentialCourseId,
            studentId: studentId
        })
    };
}
