/**
 * INPUT PARAMETER FILE: Microcredential Course Excel Insert Input DTO Builder
 * Builds input parameter body for MicrocredentialCourseExcelInsert POST request.
 * 
 * @param {object} [data={}] - Object containing adminId, microCourseExcelDataList, microCourseLearnList, materialIncludeList
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialCourseExcelInsertInput(data = {}) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            adminId: Number(data?.adminId || data?.AdminId || 1),
            AdminId: Number(data?.adminId || data?.AdminId || 1),
            microCourseExcelDataList: data?.microCourseExcelDataList || data?.MicroCourseExcelDataList || [],
            microCourseLearnList: data?.microCourseLearnList || data?.MicroCourseLearnList || [],
            materialIncludeList: data?.materialIncludeList || data?.MaterialIncludeList || []
        })
    };
}
