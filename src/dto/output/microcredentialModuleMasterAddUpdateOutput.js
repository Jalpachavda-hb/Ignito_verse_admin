/**
 * OUTPUT PARAMETER FILE: Microcredential Module Master Add/Update Output DTO Parser
 * Parses response for MicrocredentialModuleMasterAddUpdate POST request.
 * 
 * @param {object} rawJson - Raw API response
 * @param {number} status - HTTP status code
 * @returns {object} Standardized response object
 */
export function parseMicrocredentialModuleMasterAddUpdateOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || rawJson?.Message || 'Modules saved successfully',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
    rawData: rawJson
  };
}

export function parseMicrocredentialModuleMasterAddUpdateErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to save module(s)',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Server error',
    rawData: rawJson
  };
}
