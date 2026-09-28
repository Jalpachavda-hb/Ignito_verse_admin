/**
 * OUTPUT PARAMETER FILE: Get Microcredential Course Detail Output DTO Parser
 * Parses response data for GetMicrocredentialCourseDetail POST request.
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO
 */
export function parseGetMicrocredentialCourseDetailOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

    const rawMaterials = rawJson?.materialIncludeOutputList || rawJson?.MaterialIncludeOutputList || [];
    const materialIncludeOutputList = Array.isArray(rawMaterials)
        ? rawMaterials.map(item => {
            if (typeof item === 'string') {
                return {
                    materialIncludeId: 0,
                    MaterialIncludeId: 0,
                    materialInclude: item,
                    MaterialInclude: item
                };
            }
            const id = item?.materialIncludeId ?? item?.MaterialIncludeId ?? 0;
            const text = item?.materialInclude || item?.MaterialInclude || '';
            return {
                materialIncludeId: id,
                MaterialIncludeId: id,
                materialInclude: text,
                MaterialInclude: text
            };
        })
        : [];

    const rawLearns = rawJson?.microCourseLearnOutputList || rawJson?.MicroCourseLearnOutputList || [];
    const microCourseLearnOutputList = Array.isArray(rawLearns)
        ? rawLearns.map(item => {
            if (typeof item === 'string') {
                return {
                    microCourseLearnId: 0,
                    MicroCourseLearnId: 0,
                    microCourseLearn: item,
                    MicroCourseLearn: item
                };
            }
            const id = item?.microCourseLearnId ?? item?.MicroCourseLearnId ?? 0;
            const text = item?.microCourseLearn || item?.MicroCourseLearn || '';
            return {
                microCourseLearnId: id,
                MicroCourseLearnId: id,
                microCourseLearn: text,
                MicroCourseLearn: text
            };
        })
        : [];

    return {
        success: isSuccess,
        status,
        message: rawJson?.message || rawJson?.Message || '',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || 0,

        microcredentialCourseId: rawJson?.microcredentialCourseId ?? rawJson?.MicrocredentialCourseId ?? 0,
        microcredentialCourseStreamId: rawJson?.microcredentialCourseStreamId ?? rawJson?.MicrocredentialCourseStreamId ?? 0,
        microcredentialCourseName: rawJson?.microcredentialCourseName || rawJson?.MicrocredentialCourseName || '',
        microcredentialCourseLevelId: rawJson?.microcredentialCourseLevelId ?? rawJson?.MicrocredentialCourseLevelId ?? 0,
        courseLevel: rawJson?.courseLevel || rawJson?.CourseLevel || '',
        microcredentialCoursePrice: rawJson?.microcredentialCoursePrice ?? rawJson?.MicrocredentialCoursePrice ?? 0,
        microcredentialCourseRating: rawJson?.microcredentialCourseRating ?? rawJson?.MicrocredentialCourseRating ?? 0,
        aboutMicrocredentialCourse: rawJson?.aboutMicrocredentialCourse || rawJson?.AboutMicrocredentialCourse || '',
        microcredentialCourseDescription: rawJson?.microcredentialCourseDescription || rawJson?.MicrocredentialCourseDescription || '',
        microcredentialCourseDuration: rawJson?.microcredentialCourseDuration || rawJson?.MicrocredentialCourseDuration || '',
        microcredentialCourseIntroImage: rawJson?.microcredentialCourseIntroImage || rawJson?.MicrocredentialCourseIntroImage || '',
        microcredentialCourseIntroURL: rawJson?.microcredentialCourseIntroURL || rawJson?.MicrocredentialCourseIntroURL || '',
        microcredentialCourseFormat: rawJson?.microcredentialCourseFormat || rawJson?.MicrocredentialCourseFormat || '',
        certificateName: rawJson?.certificateName || rawJson?.CertificateName || '',
        certificateImage: rawJson?.certificateImage || rawJson?.CertificateImage || '',
        certificatioSkillLevel: rawJson?.certificatioSkillLevel || rawJson?.CertificatioSkillLevel || '',
        languageId: rawJson?.languageId ?? rawJson?.LanguageId ?? 0,
        language: rawJson?.language || rawJson?.Language || '',
        streamName: rawJson?.streamName || rawJson?.StreamName || '',
        professorName: rawJson?.professorName || rawJson?.ProfessorName || '',
        profileImage: rawJson?.profileImage || rawJson?.ProfileImage || '',
        updatedOn: rawJson?.updatedOn || rawJson?.UpdatedOn || '',
        materialIncludeOutputList,
        MaterialIncludeOutputList: materialIncludeOutputList,
        microCourseLearnOutputList,
        MicroCourseLearnOutputList: microCourseLearnOutputList,
        encryptedMicrocredentialCourseId: rawJson?.encryptedMicrocredentialCourseId || rawJson?.EncryptedMicrocredentialCourseId || '',
        rawData: rawJson
    };
}

export function parseGetMicrocredentialCourseDetailErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to get microcredential course detail',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || rawJson?.ErrorNo || status,

        microcredentialCourseId: 0,
        microcredentialCourseStreamId: 0,
        microcredentialCourseName: '',
        microcredentialCourseLevelId: 0,
        courseLevel: '',
        microcredentialCoursePrice: 0,
        microcredentialCourseRating: 0,
        aboutMicrocredentialCourse: '',
        microcredentialCourseDescription: '',
        microcredentialCourseDuration: '',
        microcredentialCourseIntroImage: '',
        microcredentialCourseIntroURL: '',
        microcredentialCourseFormat: '',
        certificateName: '',
        certificateImage: '',
        certificatioSkillLevel: '',
        languageId: 0,
        language: '',
        streamName: '',
        professorName: '',
        profileImage: '',
        updatedOn: '',
        materialIncludeOutputList: [],
        MaterialIncludeOutputList: [],
        microCourseLearnOutputList: [],
        MicroCourseLearnOutputList: [],
        encryptedMicrocredentialCourseId: '',
        rawData: rawJson
    };
}
