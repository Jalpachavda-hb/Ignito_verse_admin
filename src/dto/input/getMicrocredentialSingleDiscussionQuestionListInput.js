/**
 * INPUT PARAMETER FILE: Get Microcredential Single Discussion Question List Input DTO Builder
 * Builds input parameter body for GetMicrocredentialSingleDiscussionQuestionList POST request.
 * 
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='MicroCourseId'] - Column to order by
 * @param {string} [orderByDirection='DESC'] - Order direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @param {number} [adminId=0] - Admin identifier
 * @param {string} [searchInput=''] - Search term
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicrocredentialSingleDiscussionQuestionListInput(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'MicroCourseId',
    orderByDirection = 'DESC',
    totalRecords = 0,
    adminId = 1,
    searchInput = ''
) {
    const cleanAdminId = Number(adminId || 1);
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            pageNo: pageNo,
            pageSize: pageSize,
            orderByColumn: orderByColumn,
            orderByDirection: orderByDirection,
            totalRecords: totalRecords,
            adminId: cleanAdminId,
            AdminId: cleanAdminId,
            searchInput: searchInput
        })
    };
}
