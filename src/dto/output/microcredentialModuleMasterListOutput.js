/**
 * OUTPUT PARAMETER FILE: Microcredential Module Master List Output DTO Parser
 * Parses response for MicrocredentialModuleMasterList POST request.
 * 
 * @param {object} rawJson - Raw API response
 * @param {number} status - HTTP status code
 * @returns {object} Standardized module list response
 */
export function parseMicrocredentialModuleMasterListOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

  const rawList =
    rawJson?.microcredentialModuleMasterList ||
    rawJson?.MicrocredentialModuleMasterList ||
    rawJson?.moduleList ||
    rawJson?.data ||
    [];

  const microcredentialModuleMasterList = Array.isArray(rawList)
    ? rawList.map(item => ({
        microcredentialModuleMasterId: item?.microcredentialModuleMasterId ?? item?.MicrocredentialModuleMasterId ?? 0,
        microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
        microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
        moduleName: item?.moduleName || item?.ModuleName || '',
        moduleDescription: item?.moduleDescription || item?.ModuleDescription || '',
        moduleBannerImage: item?.moduleBannerImage || item?.ModuleBannerImage || '',
        createdBy: item?.createdBy ?? item?.CreatedBy ?? 1,
        updatedOn: item?.updatedOn || item?.UpdatedOn || '',
        isActive: item?.isActive ?? item?.IsActive ?? true
      }))
    : [];

  const rawPage = rawJson?.pageDetail || rawJson?.PageDetail || {};
  const totalRecords = rawPage?.totalRecords ?? rawPage?.TotalRecords ?? microcredentialModuleMasterList.length;

  const pageDetail = {
    totalRecords: Number(totalRecords || 0),
    pageSize: Number(rawPage?.pageSize ?? rawPage?.PageSize ?? 10),
    pageNo: Number(rawPage?.pageNo ?? rawPage?.PageNo ?? 1),
    orderByColumn: rawPage?.orderByColumn || rawPage?.OrderByColumn || 'UpdatedOn',
    orderByDirection: rawPage?.orderByDirection || rawPage?.OrderByDirection || 'DESC'
  };

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || rawJson?.Message || '',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
    microcredentialModuleMasterList,
    pageDetail,
    rawData: rawJson
  };
}

export function parseMicrocredentialModuleMasterListErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to fetch module list',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Server error',
    microcredentialModuleMasterList: [],
    pageDetail: {
      totalRecords: 0,
      pageSize: 10,
      pageNo: 1,
      orderByColumn: 'UpdatedOn',
      orderByDirection: 'DESC'
    },
    rawData: rawJson
  };
}
