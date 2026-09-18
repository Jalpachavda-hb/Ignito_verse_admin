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
  const hasErrorMessage = Boolean(rawJson?.message && !rawJson?.message.toLowerCase().includes("no record")) && Boolean(rawJson?.errorDescription);
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk) || (isHttpOk && !hasErrorMessage);

  const rawList =
    rawJson?.microcredentialModuleList ||
    rawJson?.MicrocredentialModuleList ||
    rawJson?.moduleList ||
    rawJson?.data ||
    [];

  const microcredentialModuleList = Array.isArray(rawList)
    ? rawList.map(item => {
        const moduleId = item?.microcredentialModuleMasterId ?? item?.MicrocredentialModuleMasterId ?? item?.id ?? 0;
        const courseId = item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? item?.courseId ?? 0;
        const moduleName = item?.moduleName || item?.ModuleName || item?.name || '';
        return {
          microcredentialModuleMasterId: moduleId,
          moduleId: moduleId,
          id: moduleId,
          microcredentialCourseId: courseId,
          courseId: courseId,
          moduleName: moduleName,
          name: moduleName,
          moduleDescription: item?.moduleDescription || item?.ModuleDescription || '',
          moduleBannerImage: item?.moduleBannerImage || item?.ModuleBannerImage || '',
          rawData: item
        };
      })
    : [];

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || rawJson?.Message || '',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
    microcredentialModuleList,
    modules: microcredentialModuleList,
    moduleList: microcredentialModuleList,
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
    modules: [],
    moduleList: [],
    rawData: rawJson
  };
}
