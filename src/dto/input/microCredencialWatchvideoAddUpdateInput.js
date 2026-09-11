/**
 * INPUT PARAMETER FILE: Microcredential Watch Video Add/Update Input DTO Builder
 * Builds input parameter body for Microcredential watch video add/update POST request.
 * 
 * @param {number} studentId - Student identifier
 * @param {number} microcredentialCourseId - Microcredential course identifier
 * @param {number} overallPercentage - Overall percentage completed
 * @param {Array<{videoId: string, percentageWatched: number, totalDuration: number, watchedSeconds: number}>} studentwatchvideodetails - Array of student watch video details
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicroCredencialWatchvideoAddUpdateInput(
    studentId = 0,
    microcredentialCourseId = 0,
    overallPercentage = 0,
    studentwatchvideodetails = []
) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            studentId: studentId,
            microcredentialCourseId: microcredentialCourseId,
            overallPercentage: overallPercentage,
            studentwatchvideodetails: studentwatchvideodetails
        })
    };
}
