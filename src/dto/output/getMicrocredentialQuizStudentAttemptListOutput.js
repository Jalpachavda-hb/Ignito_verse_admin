/**
 * OUTPUT DTO PARSER: Get Microcredential Quiz Student Attempt List
 * Endpoint: POST /api/StudentMicrocredentialQuizAPI/GetMicrocredentialQuizStudentAttemptList
 */
export function parseGetMicrocredentialQuizStudentAttemptListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.quizAttemptList || rawJson?.QuizAttemptList || [];
    const quizAttemptList = Array.isArray(rawList)
        ? rawList.map(item => ({
            attemptId: item?.attemptId ?? item?.AttemptId ?? 0,
            quizId: item?.quizId ?? item?.QuizId ?? 0,
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            microcredentialQuizAttemptNumber: item?.microcredentialQuizAttemptNumber ?? item?.MicrocredentialQuizAttemptNumber ?? 1,
            score: Number(item?.score ?? item?.Score ?? 0),
            totalPoints: Number(item?.totalPoints ?? item?.TotalPoints ?? 0),
            percentage: Number(item?.percentage ?? item?.Percentage ?? 0),
            totalQuestions: Number(item?.totalQuestions ?? item?.TotalQuestions ?? 0),
            correctQuestionsCount: Number(item?.correctQuestionsCount ?? item?.CorrectQuestionsCount ?? 0),
            wrongAnswers: Number(item?.wrongAnswers ?? item?.WrongAnswers ?? 0),
            skippedQuestions: Number(item?.skippedQuestions ?? item?.SkippedQuestions ?? 0),
            grade: item?.grade || item?.Grade || 'F'
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        quizAttemptList,
        rawData: rawJson
    };
}

export function parseGetMicrocredentialQuizStudentAttemptListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to fetch student quiz attempts',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || 'Error',
        errorNo: status,
        quizAttemptList: [],
        rawData: rawJson
    };
}
