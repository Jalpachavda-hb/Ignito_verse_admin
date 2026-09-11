export function parsemicrocredentialCourseBindDataListOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || '',
        errorDescription: rawJson?.errorDescription || '',
        errorNo: rawJson?.errorNo || 0,
        microcredentialCourseBindDatas: rawJson?.microcredentialCourseBindDatas || [],
        pageDetail: rawJson?.pageDetail || {
            startRecord: 0,
            endRecord: 0,
            pageNo: 1,
            pageSize: 10,
            orderByColumn: 'UpdatedOn',
            orderByDirection: 'DESC',
            totalRecords: 0,
            searchInput: null
        },
        courseLevelCount: rawJson?.courseLevelCount || [],
        rawData: rawJson
    };
}

export function parsemicrocredentialCourseBindDataListErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || 'Failed to load microcredential course list',
        errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || status,
        microcredentialCourseBindDatas: [],
        pageDetail: null,
        courseLevelCount: [],
        rawData: rawJson
    };
}

export const parseMicrocredentialCourseBindDataListOutput = parsemicrocredentialCourseBindDataListOutput;
export const parseMicrocredentialCourseBindDataListErrorOutput = parsemicrocredentialCourseBindDataListErrorOutput;