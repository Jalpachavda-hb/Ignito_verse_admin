/**
 * INPUT PARAMETER FILE: Get Micro Course Material Include Data Input DTO Builder
 * Builds input parameter body for GetMicroCourseMaterialIncludeData POST request.
 * 
 * @param {number} [microcredentialCourseId=0] - Microcredential course identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicroCourseMaterialIncludeDataInput(microcredentialCourseId = 0) {
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
