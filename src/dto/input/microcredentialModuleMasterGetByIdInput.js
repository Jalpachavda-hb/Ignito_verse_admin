/**
 * INPUT PARAMETER FILE: Microcredential Module Master Get By ID Input DTO Builder
 * Builds input payload for MicrocredentialModuleMasterGetById POST request.
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterGetById
 * 
 * @param {number} microcredentialModuleMasterId - Module identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialModuleMasterGetByIdInput(microcredentialModuleMasterId = 0) {
  const moduleId = Number(microcredentialModuleMasterId || 0);
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      MicrocredentialModuleMasterId: moduleId,
      microcredentialModuleMasterId: moduleId
    })
  };
}
