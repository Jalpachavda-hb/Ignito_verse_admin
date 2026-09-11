/**
 * OUTPUT PARAMETER FILE: Student Microcredentials Quiz Attempt List Output DTO Parser
 * Parses response data for StudentMicrocredentialsQuizAttemptList POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with microStudentQuizAttemptList and pageDetail
 */
export function parseStudentMicrocredentialsQuizAttemptListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.microStudentQuizAttemptList || rawJson?.MicroStudentQuizAttemptList || [];

    const microStudentQuizAttemptList = Array.isArray(rawList)
        ? rawList.map(item => ({
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            quizName: item?.quizName || item?.QuizName || '',
            quizId: item?.quizId ?? item?.QuizId ?? 0,
            lastAttemptDate: item?.lastAttemptDate || item?.LastAttemptDate || '',
            totalAttempt: item?.totalAttempt ?? item?.TotalAttempt ?? 0
        }))
        : [];

    const rawPageDetail = rawJson?.pageDetail || rawJson?.PageDetail || {};
    const pageDetail = {
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10,
        orderByColumn: rawPageDetail?.orderByColumn || rawPageDetail?.OrderByColumn || 'QuizId',
        orderByDirection: rawPageDetail?.orderByDirection || rawPageDetail?.OrderByDirection || 'DESC',
        totalRecords: rawPageDetail?.totalRecords ?? rawPageDetail?.TotalRecords ?? 0,
        searchInput: rawPageDetail?.searchInput || rawPageDetail?.SearchInput || '',
        studentId: rawPageDetail?.studentId ?? rawPageDetail?.StudentId ?? 0
    };

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,

        microStudentQuizAttemptList,
        pageDetail,
        rawData: rawJson
    };
}

export function parseStudentMicrocredentialsQuizAttemptListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to fetch student quiz attempt list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,

        microStudentQuizAttemptList: [],
        pageDetail: {
            pageNo: 1,
            pageSize: 10,
            orderByColumn: 'QuizId',
            orderByDirection: 'DESC',
            totalRecords: 0,
            searchInput: '',
            studentId: 0
        },
        rawData: rawJson
    };
}
