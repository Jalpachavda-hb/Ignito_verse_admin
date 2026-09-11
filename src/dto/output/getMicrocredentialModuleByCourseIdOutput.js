/**
 * OUTPUT PARAMETER FILE: Get Microcredential Module By Course ID Output DTO Parser
 * Parses response for GetMicrocredentialModuleByCourseId POST request.
 * 
 * @param {object} rawJson - Raw API response
 * @param {number} status - HTTP status code
 * @returns {object} Standardized modules by course response
 */
export function parseGetMicrocredentialModuleByCourseIdOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

  const rawList =
    rawJson?.microcredentialModuleList ||
    rawJson?.MicrocredentialModuleList ||
    rawJson?.moduleList ||
    rawJson?.data ||
    [];

  const microcredentialModuleList = Array.isArray(rawList)
    ? rawList.map(item => ({
        microcredentialModuleMasterId: item?.microcredentialModuleMasterId ?? item?.MicrocredentialModuleMasterId ?? 0,
        microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
        moduleName: item?.moduleName || item?.ModuleName || '',
        moduleDescription: item?.moduleDescription || item?.ModuleDescription || '',
        moduleBannerImage: item?.moduleBannerImage || item?.ModuleBannerImage || ''
      }))
    : [];

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || rawJson?.Message || '',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
    microcredentialModuleList,
    rawData: rawJson
  };
}

export function parseGetMicrocredentialModuleByCourseIdErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to fetch course modules',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Server error',
    microcredentialModuleList: [],
    rawData: rawJson
  };
}
