/**
 * OUTPUT PARAMETER FILE: Get Review By Micro Course Id Output DTO Parser
 * Parses response data for GetReviewByMicroCourseId POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO
 */
export function parseGetReviewByMicroCourseIdOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.getReviewByMicroCourseList || rawJson?.GetReviewByMicroCourseList || [];

    const getReviewByMicroCourseList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialCourseReviewId: item?.microcredentialCourseReviewId ?? item?.MicrocredentialCourseReviewId ?? 0,
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
            reviewInStar: item?.reviewInStar ?? item?.ReviewInStar ?? 0,
            reviewDescription: item?.reviewDescription || item?.ReviewDescription || '',
            studentName: item?.studentName || item?.StudentName || '',
            studentProfileImage: item?.studentProfileImage || item?.StudentProfileImage || '',
            createdOnText: item?.createdOnText || item?.CreatedOnText || '',
            createdOn: item?.createdOn || item?.CreatedOn || '',
            isReviewLikedByStudent: Boolean(item?.isReviewLikedByStudent ?? item?.IsReviewLikedByStudent ?? false),
            reviewLikeCount: item?.reviewLikeCount ?? item?.ReviewLikeCount ?? 0
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,

        getReviewByMicroCourseList,
        rawData: rawJson
    };
}

export function parseGetReviewByMicroCourseIdErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get reviews for microcredential course',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,

        getReviewByMicroCourseList: [],
        rawData: rawJson
    };
}
