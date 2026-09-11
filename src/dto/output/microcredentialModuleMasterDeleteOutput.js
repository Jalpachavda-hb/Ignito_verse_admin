/**
 * OUTPUT PARAMETER FILE: Microcredential Module Master Delete Output DTO Parser
 * Parses response for MicrocredentialModuleMasterDelete POST request.
 * 
 * @param {object} rawJson - Raw API response
 * @param {number} status - HTTP status code
 * @returns {object} Standardized delete response
 */
export function parseMicrocredentialModuleMasterDeleteOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || rawJson?.Message || 'Module deleted successfully',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
    rawData: rawJson
  };
}

export function parseMicrocredentialModuleMasterDeleteErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to delete module',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Server error',
    rawData: rawJson
  };
}
