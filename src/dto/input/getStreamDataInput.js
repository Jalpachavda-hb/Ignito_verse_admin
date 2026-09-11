/**
 * INPUT PARAMETER FILE: Get Stream Data Input DTO Builder
 * Builds input parameter body for GetStreamData POST request.
 * 
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetStreamDataInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}
