/**
 * INPUT PARAMETER FILE: Get Micro Course Learn Data Input DTO Builder
 * Builds input parameter body for GetMicroCourseLearnData POST request.
 * 
 * @param {number} [microcredentialCourseId=0] - Microcredential course identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicroCourseLearnDataInput(microcredentialCourseId = 0) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            microcredentialCourseId: microcredentialCourseId
        })
    };
}
