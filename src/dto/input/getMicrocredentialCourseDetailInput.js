/**
 * INPUT PARAMETER FILE: Get Microcredential Course Detail Input DTO Builder
 * Builds input parameter body for GetMicrocredentialCourseDetail POST request.
 * 
 * @param {number|string} microcredentialCourseId - Microcredential course identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicrocredentialCourseDetailInput(microcredentialCourseId) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        },
        body: JSON.stringify({
            MicrocredentialCourseId: microcredentialCourseId,
            microcredentialCourseId: microcredentialCourseId
        }),
        microcredentialCourseId
    };
}
