/**
 * INPUT PARAMETER FILE: Microcredential Module Master Add/Update Input DTO Builder
 * Builds input payload for MicrocredentialModuleMasterAddUpdate POST request.
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterAddUpdate
 * 
 * Supports both single module and bulk modules list.
 * 
 * @param {object} [data={}] - Module data or bulk object
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialModuleMasterAddUpdateInput(data = {}) {
  const adminId = Number(data?.AdminId ?? data?.adminId ?? 1);
  const courseId = Number(data?.MicrocredentialCourseId ?? data?.microcredentialCourseId ?? 0);
  const moduleId = Number(data?.MicrocredentialModuleMasterId ?? data?.microcredentialModuleMasterId ?? 0);
  const moduleName = data?.ModuleName || data?.moduleName || '';
  const moduleDescription = data?.ModuleDescription || data?.moduleDescription || '';
  const moduleBannerImage = data?.ModuleBannerImage || data?.moduleBannerImage || '';

  const rawList = data?.MicrocredentialModuleList || data?.microcredentialModuleList;
  const hasModuleList = Array.isArray(rawList) && rawList.length > 0;

  const payload = {
    AdminId: adminId,
    adminId: adminId,
    MicrocredentialCourseId: courseId,
    microcredentialCourseId: courseId,
  };

  if (hasModuleList) {
    const formattedList = rawList.map(item => ({
      MicrocredentialModuleMasterId: Number(item?.MicrocredentialModuleMasterId ?? item?.microcredentialModuleMasterId ?? 0),
      microcredentialModuleMasterId: Number(item?.MicrocredentialModuleMasterId ?? item?.microcredentialModuleMasterId ?? 0),
      ModuleName: item?.ModuleName || item?.moduleName || '',
      moduleName: item?.ModuleName || item?.moduleName || '',
      ModuleDescription: item?.ModuleDescription || item?.moduleDescription || '',
      moduleDescription: item?.ModuleDescription || item?.moduleDescription || '',
      ModuleBannerImage: item?.ModuleBannerImage || item?.moduleBannerImage || '',
      moduleBannerImage: item?.ModuleBannerImage || item?.moduleBannerImage || ''
    }));

    payload.MicrocredentialModuleList = formattedList;
    payload.microcredentialModuleList = formattedList;
  } else {
    payload.MicrocredentialModuleMasterId = moduleId;
    payload.microcredentialModuleMasterId = moduleId;
    payload.ModuleName = moduleName;
    payload.moduleName = moduleName;
    payload.ModuleDescription = moduleDescription;
    payload.moduleDescription = moduleDescription;
    payload.ModuleBannerImage = moduleBannerImage;
    payload.moduleBannerImage = moduleBannerImage;
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  };
}
