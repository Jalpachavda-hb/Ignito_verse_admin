/**
 * INPUT PARAMETER FILE: Get Microcredential Student Download Documents Input DTO Builder
 * Builds input parameter body for GetMicrocredentialStudentDownloadDocuments POST request.
 * 
 * @param {number|object} [courseIdOrParams=0] - Microcredential course ID or parameter object
 * @param {number} [microcredentialModuleMasterId=0] - Microcredential module master ID
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildGetMicrocredentialStudentDownloadDocumentsInput(courseIdOrParams = 0, microcredentialModuleMasterId = 0) {
    let courseId = 0;
    let moduleId = 0;

    if (typeof courseIdOrParams === 'object' && courseIdOrParams !== null) {
        courseId = Number(
            courseIdOrParams.microcredentialCourseId ??
            courseIdOrParams.MicrocredentialCourseId ??
            courseIdOrParams.courseId ??
            0
        );
        moduleId = Number(
            courseIdOrParams.microcredentialModuleMasterId ??
            courseIdOrParams.MicrocredentialModuleMasterId ??
            courseIdOrParams.moduleId ??
            courseIdOrParams.ModuleId ??
            0
        );
    } else {
        courseId = Number(courseIdOrParams || 0);
        moduleId = Number(microcredentialModuleMasterId || 0);
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            microcredentialCourseId: courseId,
            microcredentialModuleMasterId: moduleId
        })
    };
}
