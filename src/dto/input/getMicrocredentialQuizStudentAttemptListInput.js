/**
 * INPUT DTO BUILDER: Get Microcredential Quiz Student Attempt List
 * Endpoint: POST /api/StudentMicrocredentialQuizAPI/GetMicrocredentialQuizStudentAttemptList
 */
export function buildGetMicrocredentialQuizStudentAttemptListInput(studentId = 0, quizId = 0) {
    const cleanStudentId = typeof studentId === 'object' && studentId !== null
        ? Number(studentId.studentId ?? studentId.StudentId ?? 0)
        : Number(studentId || 0);

    const cleanQuizId = typeof studentId === 'object' && studentId !== null
        ? Number(studentId.quizId ?? studentId.QuizId ?? 0)
        : Number(quizId || 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            StudentId: cleanStudentId,
            QuizId: cleanQuizId
        })
    };
}
