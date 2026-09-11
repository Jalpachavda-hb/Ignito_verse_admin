/**
 * INPUT PARAMETER FILE: Microcredential Course Add/Update Input DTO Builder
 * Builds input parameter body for MicrocredentialCourseAddUpdate POST request.
 * 
 * @param {object} courseData - Object containing course details
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialCourseAddUpdateInput(courseData = {}) {
    // Standardize materialIncludeList to array of objects [{ materialInclude: 'string' }]
    const materialIncludeList = Array.isArray(courseData.materialIncludeList)
        ? courseData.materialIncludeList.map(item =>
            typeof item === 'string' ? { materialInclude: item } : { materialInclude: item?.materialInclude || item?.MaterialInclude || '' }
        )
        : [];

    // Standardize microCourseLearnList to array of objects [{ microCourseLearn: 'string' }]
    const microCourseLearnList = Array.isArray(courseData.microCourseLearnList)
        ? courseData.microCourseLearnList.map(item =>
            typeof item === 'string' ? { microCourseLearn: item } : { microCourseLearn: item?.microCourseLearn || item?.MicroCourseLearn || '' }
        )
        : [];

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            adminId: Number(courseData.adminId || courseData.AdminId || 1),
            AdminId: Number(courseData.adminId || courseData.AdminId || 1),
            microcredentialCourseId: courseData.microcredentialCourseId ?? courseData.MicrocredentialCourseId ?? 0,
            microcredentialCourseStreamId: courseData.microcredentialCourseStreamId ?? courseData.MicrocredentialCourseStreamId ?? 0,
            microcredentialCourseName: courseData.microcredentialCourseName || courseData.MicrocredentialCourseName || '',
            microcredentialCourseLevelId: courseData.microcredentialCourseLevelId ?? courseData.MicrocredentialCourseLevelId ?? 0,
            microcredentialCoursePrice: courseData.microcredentialCoursePrice ?? courseData.MicrocredentialCoursePrice ?? 0,
            microcredentialCourseRating: courseData.microcredentialCourseRating ?? courseData.MicrocredentialCourseRating ?? 0,
            aboutMicrocredentialCourse: courseData.aboutMicrocredentialCourse || courseData.AboutMicrocredentialCourse || '',
            microcredentialCourseDescription: courseData.microcredentialCourseDescription || courseData.MicrocredentialCourseDescription || '',
            microcredentialCourseDuration: courseData.microcredentialCourseDuration || courseData.MicrocredentialCourseDuration || '',
            microcredentialCourseIntroImage: courseData.microcredentialCourseIntroImage || courseData.MicrocredentialCourseIntroImage || '',
            microcredentialCourseIntroURL: courseData.microcredentialCourseIntroURL || courseData.MicrocredentialCourseIntroURL || '',
            microcredentialCourseFormat: courseData.microcredentialCourseFormat || courseData.MicrocredentialCourseFormat || '',
            certificateName: courseData.certificateName || courseData.CertificateName || '',
            certificateImage: courseData.certificateImage || courseData.CertificateImage || '',
            certificatioSkillLevel: courseData.certificatioSkillLevel || courseData.CertificatioSkillLevel || '',
            languageId: courseData.languageId ?? courseData.LanguageId ?? 0,
            materialIncludeList: materialIncludeList,
            microCourseLearnList: microCourseLearnList
        })
    };
}
