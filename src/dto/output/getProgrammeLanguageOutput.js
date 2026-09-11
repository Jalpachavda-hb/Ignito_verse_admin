/**
 * OUTPUT PARAMETER FILE: Get Programme Language Output DTO Parser
 * Parses response data for GetProgrammeLanguage POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with getProgrammeLanguage array
 */
export function parseGetProgrammeLanguageOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.getProgrammeLanguage || rawJson?.GetProgrammeLanguage || [];

    const getProgrammeLanguage = Array.isArray(rawList)
        ? rawList.map(item => ({
            languageId: item?.languageId ?? item?.LanguageId ?? 0,
            language: item?.language || item?.Language || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,
        getProgrammeLanguage,
        rawData: rawJson
    };
}

export function parseGetProgrammeLanguageErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get programme languages',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,
        getProgrammeLanguage: [],
        rawData: rawJson
    };
}
