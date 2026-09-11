/**
 * INPUT DTO BUILDER: Get Student Microcredential Quiz Result By Attempt
 * Endpoint: POST /api/StudentMicrocredentialQuizAPI/GetStudentMicrocredentialQuizResultGetByQuizId
 */
export function buildGetStudentMicrocredentialQuizResultByAttemptInput(studentId = 0, quizId = 0, attemptId = 0) {
    const cleanStudentId = typeof studentId === 'object' && studentId !== null
        ? Number(studentId.studentId ?? studentId.StudentId ?? 0)
        : Number(studentId || 0);

    const cleanQuizId = typeof studentId === 'object' && studentId !== null
        ? Number(studentId.quizId ?? studentId.QuizId ?? 0)
        : Number(quizId || 0);

    const cleanAttemptId = typeof studentId === 'object' && studentId !== null
        ? Number(studentId.attemptId ?? studentId.AttemptId ?? 0)
        : Number(attemptId || 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            StudentId: cleanStudentId,
            QuizId: cleanQuizId,
            AttemptId: cleanAttemptId
        })
    };
}
