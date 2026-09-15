/**
 * INPUT PARAMETER FILE: Get Microcredential Topic By Module ID Input DTO Builder
 * Builds input payload for GetMicrocredentialTopicByModuleId POST request.
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialTopicByModuleId
 * 
 * @param {number} microcredentialModuleMasterId - Module master identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicrocredentialTopicByModuleIdInput(microcredentialModuleMasterId = 0) {
  const moduleId = Number(microcredentialModuleMasterId || 0);
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      microcredentialModuleMasterId: moduleId
    })
  };
}
