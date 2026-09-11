/**
 * INPUT PARAMETER FILE: Get Microcredential Course Level Input DTO Builder
 * Builds input parameter body for GetMicroCredentialCourseLevel POST request.
 * 
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicroCredentialCourseLevelInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}
