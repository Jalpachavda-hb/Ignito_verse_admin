/**
 * OUTPUT PARAMETER FILE: Get Student Enrolled Microcredential Course Output DTO Parser
 * Parses response data for GetStudentEnrolledMicrocredentialCourse POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO
 */
export function parseGetStudentEnrolledMicrocredentialCourseOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawList = rawJson?.getStudentEnrolledMicrocredentialCourseList || rawJson?.GetStudentEnrolledMicrocredentialCourseList || [];

    const getStudentEnrolledMicrocredentialCourseList = Array.isArray(rawList)
        ? rawList.map(item => ({
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            courseLevel: item?.courseLevel || item?.CourseLevel || '',
            streamName: item?.streamName || item?.StreamName || '',
            microcredentialCoursePrice: item?.microcredentialCoursePrice || item?.MicrocredentialCoursePrice || '',
            microcredentialCourseRating: item?.microcredentialCourseRating || item?.MicrocredentialCourseRating || '',
            microcredentialCourseDuration: item?.microcredentialCourseDuration || item?.MicrocredentialCourseDuration || '',
            microcredentialCourseIntroImage: item?.microcredentialCourseIntroImage || item?.MicrocredentialCourseIntroImage || '',
            language: item?.language || item?.Language || '',
            updatedOn: item?.updatedOn || item?.UpdatedOn || '',
            encryptedMicrocredentialCourseId: item?.encryptedMicrocredentialCourseId || item?.EncryptedMicrocredentialCourseId || '',
            courseStatus: item?.courseStatus || item?.CourseStatus || '',
            enrollmentDate: item?.enrollmentDate || item?.EnrollmentDate || '',
            expiryDate: item?.expiryDate || item?.ExpiryDate || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,

        getStudentEnrolledMicrocredentialCourseList,
        rawData: rawJson
    };
}

export function parseGetStudentEnrolledMicrocredentialCourseErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to fetch student enrolled microcredential courses',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,

        getStudentEnrolledMicrocredentialCourseList: [],
        rawData: rawJson
    };
}
