/**
 * INPUT PARAMETER FILE: Get Student Review By Micro Course Id Input DTO Builder
 * Builds input parameter body for GetStudentReviewByMicroCorseId POST request.
 * 
 * @param {number} studentId - Student identifier
 * @param {number} microcredentialCourseId - Microcredential course identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetStudentReviewByMicroCorseIdInput(
    studentId = 0,
    microcredentialCourseId = 0
) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            studentId: studentId,
            microcredentialCourseId: microcredentialCourseId
        })
    };
}
