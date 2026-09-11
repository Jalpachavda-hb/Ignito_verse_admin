/**
 * INPUT PARAMETER FILE: Microcredential Module Master List Input DTO Builder
 * Builds input payload for MicrocredentialModuleMasterList POST request.
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterList
 * 
 * @param {number} [adminId=1] - Admin ID
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='UpdatedOn'] - Order by column
 * @param {string} [orderByDirection='DESC'] - Order by direction ('ASC'|'DESC')
 * @param {string} [whereClause=''] - Search / filter query
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialModuleMasterListInput(
  adminId = 1,
  pageNo = 1,
  pageSize = 10,
  orderByColumn = 'UpdatedOn',
  orderByDirection = 'DESC',
  whereClause = ''
) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      AdminId: Number(adminId || 1),
      adminId: Number(adminId || 1),
      PageNo: Number(pageNo || 1),
      pageNo: Number(pageNo || 1),
      PageSize: Number(pageSize || 10),
      pageSize: Number(pageSize || 10),
      OrderByColumn: orderByColumn || 'UpdatedOn',
      orderByColumn: orderByColumn || 'UpdatedOn',
      OrderByDirection: orderByDirection || 'DESC',
      orderByDirection: orderByDirection || 'DESC',
      WhereClause: whereClause || '',
      whereClause: whereClause || ''
    })
  };
}
