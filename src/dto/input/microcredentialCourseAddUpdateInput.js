/**
 * INPUT PARAMETER FILE: Microcredential Course Add/Update Input DTO Builder
 * Builds input parameter body for MicrocredentialCourseAddUpdate POST request.
 * 
 * @param {object} courseData - Object containing course details
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicrocredentialCourseAddUpdateInput(courseData = {}) {
    // Standardize materialIncludeList to array of objects [{ materialInclude: 'string', MaterialInclude: 'string' }]
    const rawMaterialInclude =
        courseData.materialIncludeList ||
        courseData.MaterialIncludeList ||
        [];

    const materialIncludeList = Array.isArray(rawMaterialInclude)
        ? rawMaterialInclude.map(item => {
            if (typeof item === 'string') {
                return {
                    materialInclude: item,
                    MaterialInclude: item
                };
            }
            const text = item?.materialInclude || item?.MaterialInclude || '';
            const id = item?.materialIncludeId ?? item?.MaterialIncludeId;
            return {
                ...(id != null ? { materialIncludeId: id, MaterialIncludeId: id } : {}),
                materialInclude: text,
                MaterialInclude: text
            };
        })
        : [];

    // Standardize microCourseLearnList to array of objects [{ microCourseLearn: 'string', MicroCourseLearn: 'string' }]
    const rawLearnList =
        courseData.microCourseLearnList ||
        courseData.MicroCourseLearnList ||
        [];

    const microCourseLearnList = Array.isArray(rawLearnList)
        ? rawLearnList.map(item => {
            if (typeof item === 'string') {
                return {
                    microCourseLearn: item,
                    MicroCourseLearn: item
                };
            }
            const text = item?.microCourseLearn || item?.MicroCourseLearn || '';
            const id = item?.microCourseLearnId ?? item?.MicroCourseLearnId;
            return {
                ...(id != null ? { microCourseLearnId: id, MicroCourseLearnId: id } : {}),
                microCourseLearn: text,
                MicroCourseLearn: text
            };
        })
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
            MicrocredentialCourseId: courseData.microcredentialCourseId ?? courseData.MicrocredentialCourseId ?? 0,
            microcredentialCourseStreamId: courseData.microcredentialCourseStreamId ?? courseData.MicrocredentialCourseStreamId ?? 0,
            MicrocredentialCourseStreamId: courseData.microcredentialCourseStreamId ?? courseData.MicrocredentialCourseStreamId ?? 0,
            microcredentialCourseName: courseData.microcredentialCourseName || courseData.MicrocredentialCourseName || '',
            MicrocredentialCourseName: courseData.microcredentialCourseName || courseData.MicrocredentialCourseName || '',
            microcredentialCourseLevelId: courseData.microcredentialCourseLevelId ?? courseData.MicrocredentialCourseLevelId ?? 0,
            MicrocredentialCourseLevelId: courseData.microcredentialCourseLevelId ?? courseData.MicrocredentialCourseLevelId ?? 0,
            microcredentialCoursePrice: courseData.microcredentialCoursePrice ?? courseData.MicrocredentialCoursePrice ?? 0,
            MicrocredentialCoursePrice: courseData.microcredentialCoursePrice ?? courseData.MicrocredentialCoursePrice ?? 0,
            microcredentialCourseRating: courseData.microcredentialCourseRating ?? courseData.MicrocredentialCourseRating ?? 0,
            MicrocredentialCourseRating: courseData.microcredentialCourseRating ?? courseData.MicrocredentialCourseRating ?? 0,
            aboutMicrocredentialCourse: courseData.aboutMicrocredentialCourse || courseData.AboutMicrocredentialCourse || '',
            AboutMicrocredentialCourse: courseData.aboutMicrocredentialCourse || courseData.AboutMicrocredentialCourse || '',
            microcredentialCourseDescription: courseData.microcredentialCourseDescription || courseData.MicrocredentialCourseDescription || '',
            MicrocredentialCourseDescription: courseData.microcredentialCourseDescription || courseData.MicrocredentialCourseDescription || '',
            microcredentialCourseDuration: courseData.microcredentialCourseDuration || courseData.MicrocredentialCourseDuration || '',
            MicrocredentialCourseDuration: courseData.microcredentialCourseDuration || courseData.MicrocredentialCourseDuration || '',
            microcredentialCourseIntroImage: courseData.microcredentialCourseIntroImage || courseData.MicrocredentialCourseIntroImage || '',
            MicrocredentialCourseIntroImage: courseData.microcredentialCourseIntroImage || courseData.MicrocredentialCourseIntroImage || '',
            microcredentialCourseIntroURL: courseData.microcredentialCourseIntroURL || courseData.MicrocredentialCourseIntroURL || '',
            MicrocredentialCourseIntroURL: courseData.microcredentialCourseIntroURL || courseData.MicrocredentialCourseIntroURL || '',
            microcredentialCourseFormat: courseData.microcredentialCourseFormat || courseData.MicrocredentialCourseFormat || '',
            MicrocredentialCourseFormat: courseData.microcredentialCourseFormat || courseData.MicrocredentialCourseFormat || '',
            certificateName: courseData.certificateName || courseData.CertificateName || '',
            CertificateName: courseData.certificateName || courseData.CertificateName || '',
            certificateImage: courseData.certificateImage || courseData.CertificateImage || '',
            CertificateImage: courseData.certificateImage || courseData.CertificateImage || '',
            certificatioSkillLevel: courseData.certificatioSkillLevel || courseData.CertificatioSkillLevel || '',
            CertificatioSkillLevel: courseData.certificatioSkillLevel || courseData.CertificatioSkillLevel || '',
            languageId: courseData.languageId ?? courseData.LanguageId ?? 0,
            LanguageId: courseData.languageId ?? courseData.LanguageId ?? 0,
            materialIncludeList: materialIncludeList,
            MaterialIncludeList: materialIncludeList,
            microCourseLearnList: microCourseLearnList,
            MicroCourseLearnList: microCourseLearnList
        })
    };
}
