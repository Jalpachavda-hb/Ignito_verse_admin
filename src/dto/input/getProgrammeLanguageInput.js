/**
 * INPUT PARAMETER FILE: Get Programme Language Input DTO Builder
 * Builds input parameter body for GetProgrammeLanguage POST request.
 * 
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetProgrammeLanguageInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}
