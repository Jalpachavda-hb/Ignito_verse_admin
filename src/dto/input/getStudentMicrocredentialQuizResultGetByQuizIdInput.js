/**
 * INPUT PARAMETER FILE: Get Student Microcredential Quiz Result Get By Quiz Id Input DTO Builder
 * Builds input payload for GetStudentMicrocredentialQuizResultGetByQuizId POST request.
 * 
 * Supports object syntax ({ studentId, quizId, attemptId }) or positional arguments.
 * Includes both PascalCase and camelCase keys for backend model compatibility.
 */
export function buildGetStudentMicrocredentialQuizResultGetByQuizIdInput(
    arg1 = 0,
    arg2 = 0,
    arg3 = 0
) {
    let studentId = 0;
    let quizId = 0;
    let attemptId = 0;

    if (typeof arg1 === 'object' && arg1 !== null) {
        studentId = Number(arg1.studentId ?? arg1.StudentId ?? 0);
        quizId = Number(arg1.quizId ?? arg1.QuizId ?? 0);
        attemptId = Number(arg1.attemptId ?? arg1.AttemptId ?? 0);
    } else {
        const num1 = Number(arg1 || 0);
        const num2 = Number(arg2 || 0);
        const num3 = Number(arg3 || 0);

        // Handle positional variations
        if (num1 > 10 && num2 > 0 && num2 <= 10) {
            // (studentId, quizId, attemptId) e.g. (37, 3, 9)
            studentId = num1;
            quizId = num2;
        } else if (num2 > 10 && num1 > 0 && num1 <= 10) {
            // (quizId, studentId, attemptId) e.g. (3, 37, 9)
            quizId = num1;
            studentId = num2;
        } else {
            // Default positional: (studentId, quizId, attemptId)
            studentId = num1;
            quizId = num2;
        }
        attemptId = num3;
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            StudentId: studentId,
            QuizId: quizId,
            AttemptId: attemptId,
            studentId: studentId,
            quizId: quizId,
            attemptId: attemptId
        })
    };
}

