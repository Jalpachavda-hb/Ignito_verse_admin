/**
 * OUTPUT PARAMETER FILE: Get Student Review By Micro Course Id Output DTO Parser
 * Parses response data for GetStudentReviewByMicroCorseId POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO
 */
export function parseGetStudentReviewByMicroCorseIdOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,

        studentId: rawJson?.studentId ?? rawJson?.StudentId ?? 0,
        microcredentialCourseId: rawJson?.microcredentialCourseId ?? rawJson?.MicrocredentialCourseId ?? 0,
        reviewInStar: rawJson?.reviewInStar ?? rawJson?.ReviewInStar ?? 0,
        reviewDescription: rawJson?.reviewDescription || rawJson?.ReviewDescription || '',
        rawData: rawJson
    };
}

export function parseGetStudentReviewByMicroCorseIdErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get student review',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,

        studentId: 0,
        microcredentialCourseId: 0,
        reviewInStar: 0,
        reviewDescription: '',
        rawData: rawJson
    };
}
