/**
 * INPUT PARAMETER FILE: Get Student Enrolled Microcredential Course Input DTO Builder
 * Builds input payload for GetStudentEnrolledMicrocredentialCourse POST request.
 * 
 * @param {number} [studentId=3] - Student ID (default 3)
 * @param {number} [enrolledMode=1] - Enrolled Mode (default 1)
 * @returns {object} Object containing headers and stringified JSON body
 */
export function buildGetStudentEnrolledMicrocredentialCourseInput(
    studentId = 3,
    enrolledMode = 1
) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            studentId: Number(studentId),
            enrolledMode: Number(enrolledMode),
            StudentId: Number(studentId),
            EnrolledMode: Number(enrolledMode)
        })
    };
}
