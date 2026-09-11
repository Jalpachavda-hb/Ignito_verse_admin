/**
 * INPUT PARAMETER FILE: Ignito Micro Student Review Insert Input DTO Builder
 * Builds input parameter body for IgnitoMicroStudentReviewInsert POST request.
 * 
 * @param {number} studentId - Student identifier
 * @param {number} microcredentialCourseId - Microcredential course identifier
 * @param {number} reviewInStar - Rating in stars
 * @param {string} reviewDescription - Text review description
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildIgnitoMicroStudentReviewInsertInput(
    studentId = 0,
    microcredentialCourseId = 0,
    reviewInStar = 0,
    reviewDescription = ''
) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            studentId: studentId,
            microcredentialCourseId: microcredentialCourseId,
            reviewInStar: reviewInStar,
            reviewDescription: reviewDescription
        })
    };
}
