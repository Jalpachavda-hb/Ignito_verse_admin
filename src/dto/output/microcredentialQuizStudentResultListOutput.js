/**
 * OUTPUT DTO PARSER: Microcredential Quiz Student Result List
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicrocredentialQuizStudentResultList
 */
export function parseMicrocredentialQuizStudentResultListOutput(rawJson = [], status = 200) {
    const isHttpOk = status >= 200 && status < 300;

    let rawList = [];
    if (Array.isArray(rawJson)) {
        rawList = rawJson;
    } else if (rawJson && typeof rawJson === 'object') {
        rawList = rawJson.studentResultList ||
            rawJson.StudentResultList ||
            rawJson.resultList ||
            rawJson.quizStudentResultList ||
            rawJson.data ||
            [];
    }

    const studentResultList = Array.isArray(rawList)
        ? rawList.map(item => ({
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            quizId: item?.quizId ?? item?.QuizId ?? 0,
            studentName: item?.studentName || item?.StudentName || '',
            email: item?.email || item?.Email || '',
            quizTitle: item?.quizTitle || item?.QuizTitle || '',
            quizDescription: item?.quizDescription || item?.QuizDescription || '',
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            streamName: item?.streamName || item?.StreamName || ''
        }))
        : [];

    return {
        success: isHttpOk,
        status,
        studentResultList,
        totalRecords: rawJson?.totalRecords ?? rawJson?.TotalRecords ?? studentResultList.length,
        rawData: rawJson
    };
}

export function parseMicrocredentialQuizStudentResultListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        studentResultList: [],
        totalRecords: 0,
        message: rawJson?.message || rawJson?.Message || 'Failed to fetch student result list',
        rawData: rawJson
    };
}
