/**
 * OUTPUT PARAMETER FILE: Microcredential Module Master Get By ID Output DTO Parser
 * Parses response for MicrocredentialModuleMasterGetById POST request.
 * 
 * @param {object} rawJson - Raw API response
 * @param {number} status - HTTP status code
 * @returns {object} Standardized module detail response
 */
export function parseMicrocredentialModuleMasterGetByIdOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

  const dataObj = rawJson?.data || rawJson?.module || rawJson;

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || rawJson?.Message || '',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
    module: {
      microcredentialModuleMasterId: dataObj?.microcredentialModuleMasterId ?? dataObj?.MicrocredentialModuleMasterId ?? 0,
      microcredentialCourseId: dataObj?.microcredentialCourseId ?? dataObj?.MicrocredentialCourseId ?? 0,
      microcredentialCourseName: dataObj?.microcredentialCourseName || dataObj?.MicrocredentialCourseName || '',
      moduleName: dataObj?.moduleName || dataObj?.ModuleName || '',
      moduleDescription: dataObj?.moduleDescription || dataObj?.ModuleDescription || '',
      moduleBannerImage: dataObj?.moduleBannerImage || dataObj?.ModuleBannerImage || '',
      isActive: dataObj?.isActive ?? dataObj?.IsActive ?? true
    },
    rawData: rawJson
  };
}

export function parseMicrocredentialModuleMasterGetByIdErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to fetch module details',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Server error',
    module: null,
    rawData: rawJson
  };
}
