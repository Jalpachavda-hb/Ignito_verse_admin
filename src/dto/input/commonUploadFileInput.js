/**
 * INPUT PARAMETER FILE: Common Upload File Input DTO Builder & UploadSource Enum
 * Builds FormData body for CommonUploadFile POST request based on .NET Web API UploadSource.
 */

/**
 * UploadSource Enum mapping directly to backend .NET Web API UploadSource enum
 */
export const UploadSource = Object.freeze({
  AboutUsBannerImage: 'AboutUsBannerImage',
  HomeBannerImage: 'HomeBannerImage',
  HomeBannerImageTwo: 'HomeBannerImageTwo',
  HomeIconImage: 'HomeIconImage',
  HomeIconImageOne: 'HomeIconImageOne',
  ChooseUsIconImage: 'ChooseUsIconImage',
  ChooseUsIconImageTwo: 'ChooseUsIconImageTwo',
  ChooseUsIconImageThree: 'ChooseUsIconImageThree',
  TrustedByLogoMaltiImages: 'TrustedByLogoMaltiImages',
  ChooseUsIconImageFour: 'ChooseUsIconImageFour',
  ChooseUsIconImageFive: 'ChooseUsIconImageFive',
  ChooseUsIconImageSix: 'ChooseUsIconImageSix',
  MicroCourseTopicpdf: 'MicroCourseTopicpdf',
  IntroImage: 'IntroImage',
  BlogBannerImage: 'BlogBannerImage',
  BlogImageOne: 'BlogImageOne',
  BlogImageTwo: 'BlogImageTwo',
  FreeCourseBannerImage: 'FreeCourseBannerImage',
  FreeCourseTopicpdf: 'FreeCourseTopicpdf',
  CommonDocument: 'CommonDocument',
  UploadMicroDocumentPdf: 'UploadMicroDocumentPdf',
  MicroStudentsendDocument: 'MicroStudentsendDocument',
  ProfileImage: 'ProfileImage',
  DegreeStudentsendDocument: 'DegreeStudentsendDocument',
  MicrocredentialStudentDownloadDocument: 'MicrocredentialStudentDownloadDocument',
  CourseBannerImage: 'CourseBannerImage',
  CreditStudentDownloadDocument: 'CreditStudentDownloadDocument',
  DegreeQuizImage: 'DegreeQuizImage',
  MicrocredentialQuizImage: 'MicrocredentialQuizImage',
  DegreeQuizWR: 'DegreeQuizWR',
  TestimonialImage: 'TestimonialImage',
  DegreeAssignmentFiles: 'DegreeAssignmentFiles',
  EntranceStudentImages: 'EntranceStudentImages',
  StackholdersImage: 'StackholdersImage',
  Certificate: 'Certificate',
  MicrocredentialModuleBannerImage: 'MicrocredentialModuleBannerImage',
});

/**
 * Maps each UploadSource to its corresponding backend server storage folder name
 */
export const UploadSourceFolderMap = Object.freeze({
  [UploadSource.AboutUsBannerImage]: 'AboutUs',
  [UploadSource.HomeBannerImage]: 'HomePageImages',
  [UploadSource.HomeBannerImageTwo]: 'HomePageImages',
  [UploadSource.HomeIconImage]: 'HomePageImages',
  [UploadSource.HomeIconImageOne]: 'HomePageImages',
  [UploadSource.ChooseUsIconImage]: 'HomePageImages',
  [UploadSource.ChooseUsIconImageTwo]: 'HomePageImages',
  [UploadSource.ChooseUsIconImageThree]: 'HomePageImages',
  [UploadSource.TrustedByLogoMaltiImages]: 'HomePageImages',
  [UploadSource.ChooseUsIconImageFour]: 'HomePageImages',
  [UploadSource.ChooseUsIconImageFive]: 'HomePageImages',
  [UploadSource.ChooseUsIconImageSix]: 'HomePageImages',
  [UploadSource.MicroCourseTopicpdf]: 'MicroCourse',
  [UploadSource.IntroImage]: 'IntroImageFolder',
  [UploadSource.BlogBannerImage]: 'Blog',
  [UploadSource.BlogImageOne]: 'Blog',
  [UploadSource.BlogImageTwo]: 'Blog',
  [UploadSource.FreeCourseBannerImage]: 'FreeCourse',
  [UploadSource.FreeCourseTopicpdf]: 'FreeCourse',
  [UploadSource.CommonDocument]: 'Unit',
  [UploadSource.UploadMicroDocumentPdf]: 'MicroDocumentUpload',
  [UploadSource.MicroStudentsendDocument]: 'MicroDocumentUpload',
  [UploadSource.ProfileImage]: 'ProfileImageAdmin',
  [UploadSource.DegreeStudentsendDocument]: 'Programme',
  [UploadSource.MicrocredentialStudentDownloadDocument]: 'MicroDocumentUpload',
  [UploadSource.CourseBannerImage]: 'Course',
  [UploadSource.CreditStudentDownloadDocument]: 'CreditDocumentUpload',
  [UploadSource.DegreeQuizImage]: 'DegreeQuizImage',
  [UploadSource.MicrocredentialQuizImage]: 'MicrocredentialQuizImage',
  [UploadSource.DegreeQuizWR]: 'DegreeQuizImage',
  [UploadSource.TestimonialImage]: 'TestimonialImage',
  [UploadSource.DegreeAssignmentFiles]: 'DegreeAssignmentFiles',
  [UploadSource.EntranceStudentImages]: 'EntranceStudentImages',
  [UploadSource.StackholdersImage]: 'StackholdersImage',
  [UploadSource.Certificate]: 'Course',
  [UploadSource.MicrocredentialModuleBannerImage]: 'Course',
});

/**
 * Builds FormData body for CommonUploadFile POST request.
 * 
 * Supports both signatures:
 * Signature 1 (Recommended): buildCommonUploadFileInput(files, source, oldPath)
 * Signature 2 (Legacy):      buildCommonUploadFileInput(files, uploadSourceKey, uploadSourceValue, oldPath)
 * 
 * @param {File|File[]|FileList|FormData} files - File or files to upload
 * @param {string} [sourceOrKey='CommonDocument'] - UploadSource enum value OR legacy key name
 * @param {string} [sourceValueOrOldPath=''] - Source value (legacy) OR oldPath
 * @param {string} [legacyOldPath=''] - Old file path (legacy)
 * @returns {{ headers: object, body: FormData }} Formatted multipart request object
 */
export function buildCommonUploadFileInput(
    files,
    sourceOrKey = UploadSource.CommonDocument,
    sourceValueOrOldPath = '',
    legacyOldPath = ''
) {
    if (files instanceof FormData) {
        return {
            headers: {},
            body: files
        };
    }

    const formData = new FormData();

    // Resolve source and oldPath depending on which signature was used
    let resolvedSource = '';
    let resolvedOldPath = '';

    if (
        sourceOrKey === 'UploadSource' ||
        sourceOrKey === 'source' ||
        sourceOrKey === 'uploadSource'
    ) {
        // Legacy call: (files, 'UploadSource', 'IntroImage', oldPath)
        resolvedSource = sourceValueOrOldPath || '';
        resolvedOldPath = legacyOldPath || '';
    } else {
        // New call: (files, UploadSource.IntroImage, oldPath)
        resolvedSource = sourceOrKey || UploadSource.CommonDocument;
        resolvedOldPath = sourceValueOrOldPath || '';
    }

    // Append file
    if (files) {
        if (files instanceof FileList || Array.isArray(files)) {
            const arr = Array.from(files);
            if (arr.length > 0) {
                formData.append('File', arr[0]);
            }
        } else if (files instanceof File || (typeof Blob !== 'undefined' && files instanceof Blob)) {
            formData.append('File', files);
        }
    }

    // Append source across all common backend parameter variations (source, UploadSource, uploadSource)
    if (resolvedSource) {
        formData.append('source', resolvedSource);
        formData.append('UploadSource', resolvedSource);
        formData.append('uploadSource', resolvedSource);
        formData.append('Source', resolvedSource);
    }

    // Append oldPath if provided
    if (resolvedOldPath) {
        formData.append('oldPath', resolvedOldPath);
        formData.append('OldPath', resolvedOldPath);
    }

    return {
        headers: {},
        body: formData
    };
}
