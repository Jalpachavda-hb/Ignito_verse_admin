/**
 * OUTPUT PARAMETER FILE: Admin Microcredential Course List Output DTO Parser
 * Parses response data for MicrocredentialCourseList POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with course list and page detail
 */
export function parseAdminMicrocredentialCourseListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.microcredentialCourseOutPutList || rawJson?.MicrocredentialCourseOutPutList || [];

    const microcredentialCourseOutPutList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
            microcredentialCourseStreamId: item?.microcredentialCourseStreamId ?? item?.MicrocredentialCourseStreamId ?? 0,
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            microcredentialCourseLevelId: item?.microcredentialCourseLevelId ?? item?.MicrocredentialCourseLevelId ?? 0,
            courseLevel: item?.courseLevel || item?.CourseLevel || '',
            microcredentialCoursePrice: item?.microcredentialCoursePrice ?? item?.MicrocredentialCoursePrice ?? 0,
            microcredentialCourseRating: item?.microcredentialCourseRating ?? item?.MicrocredentialCourseRating ?? 0,
            aboutMicrocredentialCourse: item?.aboutMicrocredentialCourse || item?.AboutMicrocredentialCourse || '',
            microcredentialCourseDescription: item?.microcredentialCourseDescription || item?.MicrocredentialCourseDescription || '',
            microcredentialCourseDuration: item?.microcredentialCourseDuration || item?.MicrocredentialCourseDuration || '',
            microcredentialCourseIntroImage: item?.microcredentialCourseIntroImage || item?.MicrocredentialCourseIntroImage || '',
            microcredentialCourseIntroURL:
                item?.microcredentialCourseIntroURL ||
                item?.MicrocredentialCourseIntroURL ||
                item?.microcredentialCourseIntroUrl ||
                item?.MicrocredentialCourseIntroUrl ||
                item?.introURL ||
                item?.introUrl ||
                item?.IntroURL ||
                item?.IntroUrl ||
                item?.courseIntroURL ||
                item?.courseIntroUrl ||
                item?.CourseIntroURL ||
                item?.CourseIntroUrl ||
                item?.introductionURL ||
                item?.introductionUrl ||
                item?.IntroductionURL ||
                item?.IntroductionUrl ||
                '',
            microcredentialCourseMaterialInclude: item?.microcredentialCourseMaterialInclude || item?.MicrocredentialCourseMaterialInclude || '',
            microcredentialCourseFormat: item?.microcredentialCourseFormat || item?.MicrocredentialCourseFormat || '',
            certificateName: item?.certificateName || item?.CertificateName || '',
            certificateImage: item?.certificateImage || item?.CertificateImage || '',
            certificatioSkillLevel: item?.certificatioSkillLevel || item?.CertificatioSkillLevel || '',
            languageId: item?.languageId ?? item?.LanguageId ?? 0,
            language: item?.language || item?.Language || '',
            streamName: item?.streamName || item?.StreamName || '',
            courseStatus: item?.courseStatus || item?.CourseStatus || ''
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
        microcredentialCourseOutPutList,
        pageDetail,
        rawData: rawJson
    };
}

export function parseAdminMicrocredentialCourseListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get microcredential course list',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        microcredentialCourseOutPutList: [],
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
