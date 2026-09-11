/**
 * INPUT PARAMETER FILE: Microcredential Module Master Delete Input DTO Builder
 * Builds input payload for MicrocredentialModuleMasterDelete POST request.
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterDelete
 * 
 * @param {number} [adminId=1] - Admin identifier
 * @param {number} [microcredentialModuleMasterId=0] - Module identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialModuleMasterDeleteInput(adminId = 1, microcredentialModuleMasterId = 0) {
  const admin = Number(adminId || 1);
  const moduleId = Number(microcredentialModuleMasterId || 0);

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      AdminId: admin,
      adminId: admin,
      MicrocredentialModuleMasterId: moduleId,
      microcredentialModuleMasterId: moduleId
    })
  };
}
