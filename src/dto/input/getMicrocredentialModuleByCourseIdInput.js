/**
 * INPUT PARAMETER FILE: Get Microcredential Module By Course ID Input DTO Builder
 * Builds input payload for GetMicrocredentialModuleByCourseId POST request.
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialModuleByCourseId
 * 
 * @param {number} microcredentialCourseId - Course identifier
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicrocredentialModuleByCourseIdInput(microcredentialCourseId = 0) {
  const courseId = Number(microcredentialCourseId || 0);
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      MicrocredentialCourseId: courseId,
      microcredentialCourseId: courseId
    })
  };
}
