/**
 * OUTPUT PARAMETER FILE: Micro Course Topic List Output DTO Parser
 * Parses response data for MicroCourseTopicList POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with microCourseTopicList and pageDetail
 */
export function parseMicroCourseTopicListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.microCourseTopicList || rawJson?.MicroCourseTopicList || [];

    const microCourseTopicList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? item?.id ?? 0,
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || item?.courseName || '',
            uploadMicroDocument: item?.uploadMicroDocument || item?.UploadMicroDocument || item?.microDocument || item?.document || '',
            updatedOn: item?.updatedOn || item?.UpdatedOn || item?.createdOn || item?.CreatedOn || '',
            streamName: item?.streamName || item?.StreamName || '',
            streamId: item?.streamId ?? item?.StreamId ?? 0
        }))
        : [];

    const rawPageDetail = rawJson?.pageDetail || rawJson?.PageDetail || {};
    const pageDetail = {
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10,
        orderByColumn: rawPageDetail?.orderByColumn || rawPageDetail?.OrderByColumn || 'MicrocredentialCourseId',
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
        microCourseTopicList,
        pageDetail,
        rawData: rawJson
    };
}

export function parseMicroCourseTopicListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get micro course topic list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        microCourseTopicList: [],
        pageDetail: {
            pageNo: 1,
            pageSize: 10,
            orderByColumn: 'MicrocredentialCourseId',
            orderByDirection: 'DESC',
            totalRecords: 0,
            adminId: 0,
            searchInput: ''
        },
        rawData: rawJson
    };
}
