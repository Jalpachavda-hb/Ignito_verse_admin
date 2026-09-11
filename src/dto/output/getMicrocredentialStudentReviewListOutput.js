/**
 * OUTPUT PARAMETER FILE: Get Microcredential Student Review List Output DTO Parser
 * Parses response data for GetMicrocredentialStudentReviewList POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with getMicrocredentialStudentReviews and pageDetail
 */
export function parseGetMicrocredentialStudentReviewListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.getMicrocredentialStudentReviews || rawJson?.GetMicrocredentialStudentReviews || [];

    const getMicrocredentialStudentReviews = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialCourseReviewId: item?.microcredentialCourseReviewId ?? item?.MicrocredentialCourseReviewId ?? 0,
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            applicantFullName: item?.applicantFullName || item?.ApplicantFullName || '',
            reviewInStar: item?.reviewInStar || item?.ReviewInStar || '',
            reviewDescription: item?.reviewDescription || item?.ReviewDescription || '',
            createdOn: item?.createdOn || item?.CreatedOn || ''
        }))
        : [];

    const rawPageDetail = rawJson?.pageDetail || rawJson?.PageDetail || {};
    const pageDetail = {
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10,
        orderByColumn: rawPageDetail?.orderByColumn || rawPageDetail?.OrderByColumn || 'MicrocredentialCourseReviewId',
        orderByDirection: rawPageDetail?.orderByDirection || rawPageDetail?.OrderByDirection || 'DESC',
        totalRecords: rawPageDetail?.totalRecords ?? rawPageDetail?.TotalRecords ?? 0,
        adminId: rawPageDetail?.adminId ?? rawPageDetail?.AdminId ?? 0,
        searchInput: rawPageDetail?.searchInput || rawPageDetail?.SearchInput || ''
    };

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        getMicrocredentialStudentReviews,
        pageDetail,
        rawData: rawJson
    };
}

export function parseGetMicrocredentialStudentReviewListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get student review list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        getMicrocredentialStudentReviews: [],
        pageDetail: {
            pageNo: 1,
            pageSize: 10,
            orderByColumn: 'MicrocredentialCourseReviewId',
            orderByDirection: 'DESC',
            totalRecords: 0,
            adminId: 0,
            searchInput: ''
        },
        rawData: rawJson
    };
}
