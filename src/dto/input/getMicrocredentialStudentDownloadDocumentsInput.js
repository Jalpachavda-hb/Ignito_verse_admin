/**
 * INPUT PARAMETER FILE: Get Microcredential Student Download Documents Input DTO Builder
 * Builds input parameter body for GetMicrocredentialStudentDownloadDocuments POST request.
 * 
 * @param {number} [microcredentialCourseId=0] - Microcredential course ID
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicrocredentialStudentDownloadDocumentsInput(microcredentialCourseId = 0) {
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
