/**
 * OUTPUT DTO PARSER: Get Student Microcredential Quiz Result By Attempt
 * Endpoint: POST /api/StudentMicrocredentialQuizAPI/GetStudentMicrocredentialQuizResultGetByQuizId
 */
export function parseGetStudentMicrocredentialQuizResultByAttemptOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const questions = Array.isArray(rawJson?.questions || rawJson?.Questions)
        ? (rawJson?.questions || rawJson?.Questions).map(item => ({
            questionsId: item?.questionsId ?? item?.QuestionsId ?? 0,
            quizId: item?.quizId ?? item?.QuizId ?? 0,
            degreeQuestionType: item?.degreeQuestionType ?? item?.DegreeQuestionType ?? 1,
            title: item?.title || item?.Title || '',
            questionText: item?.questionText || item?.QuestionText || '',
            points: Number(item?.points ?? item?.Points ?? 0),
            studentAnswerId: item?.studentAnswerId ?? item?.StudentAnswerId ?? 0,
            studentSelectedOptions: String(item?.studentSelectedOptions || item?.StudentSelectedOptions || ''),
            isStudentCorrect: Boolean(item?.isStudentCorrect ?? item?.IsStudentCorrect ?? false),
            studentPointsAwarded: Number(item?.studentPointsAwarded ?? item?.StudentPointsAwarded ?? 0),
            studentFeedback: item?.studentFeedback || item?.StudentFeedback || '',
            attemptStatus: item?.attemptStatus || item?.AttemptStatus || 'NOT_ATTEMPTED',
            correctAnswerData: String(item?.correctAnswerData || item?.CorrectAnswerData || '')
        }))
        : [];

    const answerOptions = Array.isArray(rawJson?.answerOptions || rawJson?.AnswerOptions)
        ? (rawJson?.answerOptions || rawJson?.AnswerOptions).map(item => ({
            answerId: item?.answerId ?? item?.AnswerId ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? 0,
            text: item?.text || item?.Text || '',
            answerFeedback: item?.answerFeedback || item?.AnswerFeedback || '',
            isCorrect: Boolean(item?.isCorrect ?? item?.IsCorrect ?? false),
            displayOrder: item?.displayOrder ?? item?.DisplayOrder ?? 0,
            isStudentSelected: Boolean(item?.isStudentSelected ?? item?.IsStudentSelected ?? false)
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,

        // Score summary
        quizId: rawJson?.quizId ?? rawJson?.QuizId ?? 0,
        quizStatus: rawJson?.status || rawJson?.Status || 'Completed',
        startTime: rawJson?.startTime || rawJson?.StartTime || '',
        endTime: rawJson?.endTime || rawJson?.EndTime || '',
        totalPoints: Number(rawJson?.totalPoints ?? rawJson?.TotalPoints ?? 0),
        percentage: Number(rawJson?.percentage ?? rawJson?.Percentage ?? 0),
        grade: rawJson?.grade || rawJson?.Grade || 'F',
        totalQuestions: Number(rawJson?.totalQuestions ?? rawJson?.TotalQuestions ?? 0),
        wrongAnswers: Number(rawJson?.wrongAnswers ?? rawJson?.WrongAnswers ?? 0),
        skippedQuestions: Number(rawJson?.skippedQuestions ?? rawJson?.SkippedQuestions ?? 0),
        correctQuestionsCount: Number(rawJson?.correctQuestionsCount ?? rawJson?.CorrectQuestionsCount ?? 0),
        studentTotalPoints: Number(rawJson?.studentTotalPoints ?? rawJson?.StudentTotalPoints ?? 0),

        questions,
        answerOptions,
        rawData: rawJson
    };
}

export function parseGetStudentMicrocredentialQuizResultByAttemptErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to fetch student quiz result',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || 'Error',
        errorNo: status,
        questions: [],
        answerOptions: [],
        rawData: rawJson
    };
}
