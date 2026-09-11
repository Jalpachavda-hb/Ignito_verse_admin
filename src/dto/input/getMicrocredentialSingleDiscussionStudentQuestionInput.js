/**
 * INPUT PARAMETER FILE: Get Microcredential Single Discussion Student Question Input DTO Builder
 * Builds input parameter body for GetMicrocredentialSingleDiscussionStudentQuestion POST request.
 * 
 * @param {number} [studentId=0] - Student ID
 * @param {number} [microCourseId=0] - Micro Course ID
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicrocredentialSingleDiscussionStudentQuestionInput(studentId = 0, microCourseId = 0) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            studentId: studentId,
            microCourseId: microCourseId
        })
    };
}
