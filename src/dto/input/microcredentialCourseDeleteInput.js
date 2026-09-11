/**
 * INPUT PARAMETER FILE: Microcredential Course Delete Input DTO Builder
 * Builds input parameter body for MicrocredentialCourseDelete POST request.
 * 
 * @param {number} microcredentialCourseId - Microcredential course identifier to delete
 * @param {number} [adminId=0] - Admin identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialCourseDeleteInput(
    microcredentialCourseId = 0,
    adminId = 1
) {
    const cleanAdminId = Number(adminId || 1);
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            microcredentialCourseId: microcredentialCourseId,
            adminId: cleanAdminId,
            AdminId: cleanAdminId
        })
    };
}
