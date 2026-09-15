/**
 * ADMIN MICROCREDENTIAL SERVICE
 * Service functions connecting Admin UI with backend .NET Web API endpoints.
 */

import { apiClient } from './apiClient';
import {
    UploadSource,
    UploadSourceFolderMap,
    buildCommonUploadFileInput
} from '../dto/input/commonUploadFileInput';
import { parseCommonUploadFileOutput, parseCommonUploadFileErrorOutput } from '../dto/output/commonUploadFileOutput';

export { UploadSource, UploadSourceFolderMap };
import { buildMicrocredentialCourseAddUpdateInput } from '../dto/input/microcredentialCourseAddUpdateInput';
import { parseMicrocredentialCourseAddUpdateOutput, parseMicrocredentialCourseAddUpdateErrorOutput } from '../dto/output/microcredentialCourseAddUpdateOutput';
import { buildGetStreamDataInput } from '../dto/input/getStreamDataInput';
import { parseGetStreamDataOutput, parseGetStreamDataErrorOutput } from '../dto/output/getStreamDataOutput';
import { buildGetMicroCredentialCourseLevelInput } from '../dto/input/getMicroCredentialCourseLevelInput';
import { parseGetMicroCredentialCourseLevelOutput, parseGetMicroCredentialCourseLevelErrorOutput } from '../dto/output/getMicroCredentialCourseLevelOutput';
import { buildGetProgrammeLanguageInput } from '../dto/input/getProgrammeLanguageInput';
import { parseGetProgrammeLanguageOutput, parseGetProgrammeLanguageErrorOutput } from '../dto/output/getProgrammeLanguageOutput';
import { buildAdminMicrocredentialCourseListInput } from '../dto/input/adminMicrocredentialCourseListInput';
import { parseAdminMicrocredentialCourseListOutput, parseAdminMicrocredentialCourseListErrorOutput } from '../dto/output/adminMicrocredentialCourseListOutput';
import { buildMicrocredentialCourseDeleteInput } from '../dto/input/microcredentialCourseDeleteInput';
import { parseMicrocredentialCourseDeleteOutput, parseMicrocredentialCourseDeleteErrorOutput } from '../dto/output/microcredentialCourseDeleteOutput';
import { buildGetMicroCourseMaterialIncludeDataInput } from '../dto/input/getMicroCourseMaterialIncludeDataInput';
import { parseGetMicroCourseMaterialIncludeDataOutput, parseGetMicroCourseMaterialIncludeDataErrorOutput } from '../dto/output/getMicroCourseMaterialIncludeDataOutput';
import { buildGetMicroCourseLearnDataInput } from '../dto/input/getMicroCourseLearnDataInput';
import { parseGetMicroCourseLearnDataOutput, parseGetMicroCourseLearnDataErrorOutput } from '../dto/output/getMicroCourseLearnDataOutput';
import { buildDownloadMicroTemplateInput } from '../dto/input/downloadMicroTemplateInput';
import { parseDownloadMicroTemplateOutput, parseDownloadMicroTemplateErrorOutput } from '../dto/output/downloadMicroTemplateOutput';
import { buildUploadMicroCourseExcelInput } from '../dto/input/uploadMicroCourseExcelInput';
import { parseUploadMicroCourseExcelOutput, parseUploadMicroCourseExcelErrorOutput } from '../dto/output/uploadMicroCourseExcelOutput';
import { buildMicrocredentialCourseExcelInsertInput } from '../dto/input/microcredentialCourseExcelInsertInput';
import { parseMicrocredentialCourseExcelInsertOutput, parseMicrocredentialCourseExcelInsertErrorOutput } from '../dto/output/microcredentialCourseExcelInsertOutput';
import { buildGetMicrocredentialCourseInput } from '../dto/input/getMicrocredentialCourseInput';
import { parseGetMicrocredentialCourseOutput, parseGetMicrocredentialCourseErrorOutput } from '../dto/output/getMicrocredentialCourseOutput';
import { buildMicroCourseTopicAddUpdateInput } from '../dto/input/microCourseTopicAddUpdateInput';
import { parseMicroCourseTopicAddUpdateOutput, parseMicroCourseTopicAddUpdateErrorOutput } from '../dto/output/microCourseTopicAddUpdateOutput';
import { buildMicroCourseTopicListInput } from '../dto/input/microCourseTopicListInput';
import { parseMicroCourseTopicListOutput, parseMicroCourseTopicListErrorOutput } from '../dto/output/microCourseTopicListOutput';
import { buildMicroCourseTopicDeleteInput } from '../dto/input/microCourseTopicDeleteInput';
import { parseMicroCourseTopicDeleteOutput, parseMicroCourseTopicDeleteErrorOutput } from '../dto/output/microCourseTopicDeleteOutput';
import { buildGetMicrocredentialStudentDownloadDocumentsInput } from '../dto/input/getMicrocredentialStudentDownloadDocumentsInput';
import { parseGetMicrocredentialStudentDownloadDocumentsOutput, parseGetMicrocredentialStudentDownloadDocumentsErrorOutput } from '../dto/output/getMicrocredentialStudentDownloadDocumentsOutput';
import { buildAdminGetMicroCourseManyDiscussionForumQuestionsListInput } from '../dto/input/adminGetMicroCourseManyDiscussionForumQuestionsListInput';
import { parseAdminGetMicroCourseManyDiscussionForumQuestionsListOutput, parseAdminGetMicroCourseManyDiscussionForumQuestionsListErrorOutput } from '../dto/output/adminGetMicroCourseManyDiscussionForumQuestionsListOutput';
import { buildAdminGetMicroCourseManyDiscussionQuestionReplyListInput } from '../dto/input/adminGetMicroCourseManyDiscussionQuestionReplyListInput';
import { parseAdminGetMicroCourseManyDiscussionQuestionReplyListOutput, parseAdminGetMicroCourseManyDiscussionQuestionReplyListErrorOutput } from '../dto/output/adminGetMicroCourseManyDiscussionQuestionReplyListOutput';
import { buildDeleteMicroManyDiscussionForumQuestionsInput } from '../dto/input/deleteMicroManyDiscussionForumQuestionsInput';
import { parseDeleteMicroManyDiscussionForumQuestionsOutput, parseDeleteMicroManyDiscussionForumQuestionsErrorOutput } from '../dto/output/deleteMicroManyDiscussionForumQuestionsOutput';
import { buildDeleteMicroManyDiscussionForumeReplyInput } from '../dto/input/deleteMicroManyDiscussionForumeReplyInput';
import { parseDeleteMicroManyDiscussionForumeReplyOutput, parseDeleteMicroManyDiscussionForumeReplyErrorOutput } from '../dto/output/deleteMicroManyDiscussionForumeReplyOutput';
import { buildGetMicrocredentialSingleDiscussionQuestionListInput } from '../dto/input/getMicrocredentialSingleDiscussionQuestionListInput';
import { parseGetMicrocredentialSingleDiscussionQuestionListOutput, parseGetMicrocredentialSingleDiscussionQuestionListErrorOutput } from '../dto/output/getMicrocredentialSingleDiscussionQuestionListOutput';
import { buildInsertMicroSingleDiscussionReplyInput } from '../dto/input/insertMicroSingleDiscussionReplyInput';
import { parseInsertMicroSingleDiscussionReplyOutput, parseInsertMicroSingleDiscussionReplyErrorOutput } from '../dto/output/insertMicroSingleDiscussionReplyOutput';
import { buildGetMicrocredentialSingleDiscussionStudentQuestionInput } from '../dto/input/getMicrocredentialSingleDiscussionStudentQuestionInput';
import { parseGetMicrocredentialSingleDiscussionStudentQuestionOutput, parseGetMicrocredentialSingleDiscussionStudentQuestionErrorOutput } from '../dto/output/getMicrocredentialSingleDiscussionStudentQuestionOutput';
import { buildMicrocredentialModuleMasterAddUpdateInput } from '../dto/input/microcredentialModuleMasterAddUpdateInput';
import { parseMicrocredentialModuleMasterAddUpdateOutput, parseMicrocredentialModuleMasterAddUpdateErrorOutput } from '../dto/output/microcredentialModuleMasterAddUpdateOutput';
import { buildMicrocredentialModuleMasterListInput } from '../dto/input/microcredentialModuleMasterListInput';
import { parseMicrocredentialModuleMasterListOutput, parseMicrocredentialModuleMasterListErrorOutput } from '../dto/output/microcredentialModuleMasterListOutput';
import { buildMicrocredentialModuleMasterGetByIdInput } from '../dto/input/microcredentialModuleMasterGetByIdInput';
import { parseMicrocredentialModuleMasterGetByIdOutput, parseMicrocredentialModuleMasterGetByIdErrorOutput } from '../dto/output/microcredentialModuleMasterGetByIdOutput';
import { buildMicrocredentialModuleMasterDeleteInput } from '../dto/input/microcredentialModuleMasterDeleteInput';
import { parseMicrocredentialModuleMasterDeleteOutput, parseMicrocredentialModuleMasterDeleteErrorOutput } from '../dto/output/microcredentialModuleMasterDeleteOutput';
import { buildGetMicrocredentialModuleByCourseIdInput } from '../dto/input/getMicrocredentialModuleByCourseIdInput';
import { parseGetMicrocredentialModuleByCourseIdOutput, parseGetMicrocredentialModuleByCourseIdErrorOutput } from '../dto/output/getMicrocredentialModuleByCourseIdOutput';
import { buildGetMicrocredentialStudentReviewListInput } from '../dto/input/getMicrocredentialStudentReviewListInput';
import { parseGetMicrocredentialStudentReviewListOutput, parseGetMicrocredentialStudentReviewListErrorOutput } from '../dto/output/getMicrocredentialStudentReviewListOutput';
import { buildDeleteMicrocredentialStudentReviewInput } from '../dto/input/deleteMicrocredentialStudentReviewInput';
import { parseDeleteMicrocredentialStudentReviewOutput, parseDeleteMicrocredentialStudentReviewErrorOutput } from '../dto/output/deleteMicrocredentialStudentReviewOutput';
import { buildGetMicrocredentialTopicByModuleIdInput } from '../dto/input/getMicrocredentialTopicByModuleIdInput';
import { parseGetMicrocredentialTopicByModuleIdOutput, parseGetMicrocredentialTopicByModuleIdErrorOutput } from '../dto/output/getMicrocredentialTopicByModuleIdOutput';

/**
 * Uploads one or more files using multipart/form-data.
 * API: POST /api/IgnitoMicroCredencialAPI/CommonUploadFile
 * 
 * @param {File|File[]|FileList|FormData} files - File, array of files, FileList, or pre-built FormData object
 * @param {string} [uploadSourceKey='UploadSource'] - Upload source field name
 * @param {string} [uploadSourceValue=''] - Upload source enum value (e.g. 'IntroImage', 'ProfessorImage')
 * @param {string} [oldPath=''] - Existing file path to replace
 * @returns {Promise<object>} Parsed output containing `{ success, documentList, status, rawData }`
 */
/**
 * Automatically compress an image client-side if it exceeds 2MB or 1920px
 * to prevent AWS API Gateway / Lambda 6MB payload limits and ERR_CONNECTION_RESET.
 */
async function compressImageIfNeeded(file, maxDimension = 1920, quality = 0.85, maxSizeBytes = 2 * 1024 * 1024) {
    if (!file || !(file instanceof File) || !file.type.startsWith('image/')) {
        return file;
    }
    if (file.type === 'image/svg+xml' || file.size <= maxSizeBytes) {
        return file;
    }

    try {
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    canvas.toBlob(
                        (blob) => {
                            if (blob && blob.size < file.size) {
                                const compressedFile = new File([blob], file.name, {
                                    type: outType,
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                resolve(file);
                            }
                        },
                        outType,
                        quality
                    );
                };
                img.onerror = () => resolve(file);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    } catch {
        return file;
    }
}

export async function commonUploadFile(
    files,
    uploadSourceKey = 'UploadSource',
    uploadSourceValue = '',
    oldPath = ''
) {
    try {
        let fileToUpload = files;
        if (files instanceof File && files.type.startsWith('image/')) {
            fileToUpload = await compressImageIfNeeded(files);
        }
        const inputDto = buildCommonUploadFileInput(fileToUpload, uploadSourceKey, uploadSourceValue, oldPath);
        // Try AdminCommonAPI first, fall back to IgnitoMicroCredencialAPI
        let response = await apiClient('api/AdminCommonAPI/CommonUploadFile', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && (response.status === 404 || response.status === 405)) {
            response = await apiClient('api/IgnitoMicroCredencialAPI/CommonUploadFile', {
                method: 'POST',
                headers: inputDto.headers,
                body: inputDto.body
            });
        }

        if (!response.ok && response.status !== 200) {
            return parseCommonUploadFileErrorOutput(response.data, response.status);
        }

        const outputDto = parseCommonUploadFileOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in commonUploadFile:', error);
        return parseCommonUploadFileErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Adds or updates a microcredential course.
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialCourseAddUpdate
 * 
 * @param {object} courseData - Course data payload
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function microcredentialCourseAddUpdate(courseData = {}) {
    try {
        const inputDto = buildMicrocredentialCourseAddUpdateInput(courseData);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialCourseAddUpdate', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialCourseAddUpdateErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicrocredentialCourseAddUpdateOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microcredentialCourseAddUpdate:', error);
        return parseMicrocredentialCourseAddUpdateErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches stream data list for setup/dropdowns.
 * API: POST /api/AdminSetUpAPI/GetStreamData
 * 
 * @returns {Promise<object>} Parsed output containing `{ success, streamDataList, message, status, rawData }`
 */
export async function getStreamData() {
    try {
        const inputDto = buildGetStreamDataInput();
        const response = await apiClient('api/AdminSetUpAPI/GetStreamData', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetStreamDataErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetStreamDataOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getStreamData:', error);
        return parseGetStreamDataErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches course levels list.
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicroCredentialCourseLevel
 * 
 * @returns {Promise<object>} Parsed output containing `{ success, microCredentialCourseLevelList, message, status, rawData }`
 */
export async function getMicroCredentialCourseLevel() {
    try {
        const inputDto = buildGetMicroCredentialCourseLevelInput();
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicroCredentialCourseLevel', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicroCredentialCourseLevelErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicroCredentialCourseLevelOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicroCredentialCourseLevel:', error);
        return parseGetMicroCredentialCourseLevelErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches programme language list.
 * API: POST /api/IgnitoMicroCredencialAPI/GetProgrammeLanguage
 * 
 * @returns {Promise<object>} Parsed output containing `{ success, getProgrammeLanguage, message, status, rawData }`
 */
export async function getProgrammeLanguage() {
    try {
        const inputDto = buildGetProgrammeLanguageInput();
        let response = await apiClient('api/ProgramAPI/GetProgrammeLanguage', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && (response.status === 404 || response.status === 405)) {
            response = await apiClient('api/IgnitoMicroCredencialAPI/GetProgrammeLanguage', {
                method: 'POST',
                headers: inputDto.headers,
                body: inputDto.body
            });
        }

        if (!response.ok && response.status !== 200) {
            return parseGetProgrammeLanguageErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetProgrammeLanguageOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getProgrammeLanguage:', error);
        return parseGetProgrammeLanguageErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches admin microcredential course list with pagination and filters.
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialCourseList
 * 
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='MicrocredentialCourseId'] - Column name to order by
 * @param {string} [orderByDirection='DESC'] - Sorting direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @param {number} [adminId=0] - Admin identifier
 * @param {string} [searchInput=''] - Search filter text
 * @returns {Promise<object>} Parsed output containing `{ success, microcredentialCourseOutPutList, pageDetail, message, status, rawData }`
 */
export async function adminMicrocredentialCourseList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'MicrocredentialCourseId',
    orderByDirection = 'DESC',
    totalRecords = 0,
    adminId = 1,
    searchInput = ''
) {
    try {
        const inputDto = buildAdminMicrocredentialCourseListInput(
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            totalRecords,
            adminId,
            searchInput
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialCourseList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseAdminMicrocredentialCourseListErrorOutput(response.data, response.status);
        }

        const outputDto = parseAdminMicrocredentialCourseListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in adminMicrocredentialCourseList:', error);
        return parseAdminMicrocredentialCourseListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Deletes a microcredential course.
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialCourseDelete
 * 
 * @param {number} microcredentialCourseId - Microcredential course ID to delete
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function microcredentialCourseDelete(microcredentialCourseId = 0, adminId = 1) {
    try {
        const inputDto = buildMicrocredentialCourseDeleteInput(microcredentialCourseId, adminId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialCourseDelete', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialCourseDeleteErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicrocredentialCourseDeleteOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microcredentialCourseDelete:', error);
        return parseMicrocredentialCourseDeleteErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches micro course material include data list for a course.
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicroCourseMaterialIncludeData
 * 
 * @param {number} [microcredentialCourseId=0] - Microcredential course ID
 * @returns {Promise<object>} Parsed output containing `{ success, microCourseMaterialIncludeDataList, message, status, rawData }`
 */
export async function getMicroCourseMaterialIncludeData(microcredentialCourseId = 0) {
    try {
        const inputDto = buildGetMicroCourseMaterialIncludeDataInput(microcredentialCourseId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicroCourseMaterialIncludeData', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicroCourseMaterialIncludeDataErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicroCourseMaterialIncludeDataOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicroCourseMaterialIncludeData:', error);
        return parseGetMicroCourseMaterialIncludeDataErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches micro course learn data list for a course.
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicroCourseLearnData
 * 
 * @param {number} [microcredentialCourseId=0] - Microcredential course ID
 * @returns {Promise<object>} Parsed output containing `{ success, microCourseLearnDataList, message, status, rawData }`
 */
export async function getMicroCourseLearnData(microcredentialCourseId = 0) {
    try {
        const inputDto = buildGetMicroCourseLearnDataInput(microcredentialCourseId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicroCourseLearnData', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicroCourseLearnDataErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicroCourseLearnDataOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicroCourseLearnData:', error);
        return parseGetMicroCourseLearnDataErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Downloads the Excel template for Microcredential Courses.
 * API: GET /api/IgnitoMicroCredencialAPI/DownloadMicroTemplate
 * 
 * @param {boolean} [autoDownload=true] - Automatically triggers browser file download if true
 * @returns {Promise<object>} Parsed output containing `{ success, blob, fileName, status, rawData }`
 */
export async function downloadMicroTemplate(autoDownload = true) {
    try {
        const inputDto = buildDownloadMicroTemplateInput();
        const response = await apiClient('api/IgnitoMicroCredencialAPI/DownloadMicroTemplate', {
            method: 'GET',
            headers: inputDto.headers,
            responseType: inputDto.responseType
        });

        if (!response.ok && response.status !== 200) {
            return parseDownloadMicroTemplateErrorOutput(response.data, response.status);
        }

        const outputDto = parseDownloadMicroTemplateOutput(response.data, response.status, autoDownload);
        return outputDto;
    } catch (error) {
        console.error('Error in downloadMicroTemplate:', error);
        return parseDownloadMicroTemplateErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Uploads and processes a Micro Course Excel file.
 * API: POST /api/IgnitoMicroCredencialAPI/UploadMicroCourseExcel
 * 
 * @param {File} file - Excel file object
 * @returns {Promise<object>} Parsed output containing `{ success, microCourseExcelDataList, microCourseLearnList, materialIncludeList, message, status, rawData }`
 */
export async function uploadMicroCourseExcel(file) {
    try {
        const inputDto = buildUploadMicroCourseExcelInput(file);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/UploadMicroCourseExcel', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseUploadMicroCourseExcelErrorOutput(response.data, response.status);
        }

        const outputDto = parseUploadMicroCourseExcelOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in uploadMicroCourseExcel:', error);
        return parseUploadMicroCourseExcelErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Inserts Micro Courses batch data parsed from Excel.
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialCourseExcelInsert
 * 
 * @param {object} [data={}] - Object containing adminId, microCourseExcelDataList, microCourseLearnList, materialIncludeList
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function microcredentialCourseExcelInsert(data = {}) {
    try {
        const inputDto = buildMicrocredentialCourseExcelInsertInput(data);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialCourseExcelInsert', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialCourseExcelInsertErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicrocredentialCourseExcelInsertOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microcredentialCourseExcelInsert:', error);
        return parseMicrocredentialCourseExcelInsertErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches list of microcredential courses by stream ID.
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCourse
 * 
 * @param {string|number} [streamId=''] - Stream ID filter
 * @returns {Promise<object>} Parsed output containing `{ success, microcredentialCourseOutputList, message, status, rawData }`
 */
export async function getMicrocredentialCourse(streamId = '') {
    try {
        const inputDto = buildGetMicrocredentialCourseInput(streamId);
        console.log("Fetching microcredential courses for StreamId payload:", inputDto.body);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialCourse', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            console.error("GetMicrocredentialCourse failed with status:", response.status, response.data);
            return parseGetMicrocredentialCourseErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicrocredentialCourseOutput(response.data, response.status);
        console.log("GetMicrocredentialCourse parsed output:", outputDto);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicrocredentialCourse:', error);
        return parseGetMicrocredentialCourseErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Adds or updates topics for a microcredential course.
 * API: POST /api/IgnitoMicroCredencialAPI/MicroCourseTopicAddUpdate
 * 
 * @param {object} [topicData={}] - Object containing microcredentialCourseId, streamId, adminId, uploadMicroDocument, microcredentialCourseTopicList, microcredentialStudentDownloadDocumentList
 * @returns {Promise<object>} Parsed output containing `{ success, message, studentFcmToken, studentFcmTokens, notificationMessage, status, rawData }`
 */
export async function microCourseTopicAddUpdate(topicData = {}) {
    try {
        const inputDto = buildMicroCourseTopicAddUpdateInput(topicData);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicroCourseTopicAddUpdate', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicroCourseTopicAddUpdateErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicroCourseTopicAddUpdateOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microCourseTopicAddUpdate:', error);
        return parseMicroCourseTopicAddUpdateErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches admin micro course topic list with pagination and search.
 * API: POST /api/IgnitoMicroCredencialAPI/MicroCourseTopicList
 * 
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='MicrocredentialCourseId'] - Column to order by
 * @param {string} [orderByDirection='DESC'] - Sort direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @param {number} [adminId=0] - Admin identifier
 * @param {string} [searchInput=''] - Search term
 * @returns {Promise<object>} Parsed output containing `{ success, microCourseTopicList, pageDetail, message, status, rawData }`
 */
export async function microCourseTopicList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'MicrocredentialCourseId',
    orderByDirection = 'DESC',
    totalRecords = 0,
    adminId = 1,
    searchInput = ''
) {
    try {
        const inputDto = buildMicroCourseTopicListInput(
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            totalRecords,
            adminId,
            searchInput
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicroCourseTopicList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicroCourseTopicListErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicroCourseTopicListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microCourseTopicList:', error);
        return parseMicroCourseTopicListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Deletes micro course topics for a course.
 * API: POST /api/IgnitoMicroCredencialAPI/MicroCourseTopicDelete
 * 
 * @param {number} microcredentialCourseId - Microcredential course ID
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function microCourseTopicDelete(microcredentialCourseId = 0, adminId = 1) {
    try {
        const inputDto = buildMicroCourseTopicDeleteInput(microcredentialCourseId, adminId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicroCourseTopicDelete', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicroCourseTopicDeleteErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicroCourseTopicDeleteOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microCourseTopicDelete:', error);
        return parseMicroCourseTopicDeleteErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches downloadable student documents for a microcredential course.
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialStudentDownloadDocuments
 * 
 * @param {number} [microcredentialCourseId=0] - Microcredential course ID
 * @returns {Promise<object>} Parsed output containing `{ success, adminGetMicrocredentialStudentDownloadDocumentsData, message, status, rawData }`
 */
export async function getMicrocredentialStudentDownloadDocuments(microcredentialCourseId = 0) {
    try {
        const inputDto = buildGetMicrocredentialStudentDownloadDocumentsInput(microcredentialCourseId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialStudentDownloadDocuments', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialStudentDownloadDocumentsErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicrocredentialStudentDownloadDocumentsOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicrocredentialStudentDownloadDocuments:', error);
        return parseGetMicrocredentialStudentDownloadDocumentsErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches admin micro course discussion forum questions list.
 * API: POST /api/MicroDiscussionForumAPI/AdminGetMicroCourseManyDiscussionForumQuestionsList
 * 
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='CreatedOn'] - Column to order by
 * @param {string} [orderByDirection='DESC'] - Sort direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @param {number} [adminId=1] - Admin identifier
 * @param {string} [searchInput=''] - Search term
 * @returns {Promise<object>} Parsed output containing `{ success, discussionQuestionList, pageDetail, message, status, rawData }`
 */
export async function adminGetMicroCourseManyDiscussionForumQuestionsList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'CreatedOn',
    orderByDirection = 'DESC',
    totalRecords = 0,
    adminId = 1,
    searchInput = ''
) {
    try {
        const inputDto = buildAdminGetMicroCourseManyDiscussionForumQuestionsListInput(
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            totalRecords,
            adminId,
            searchInput
        );
        const response = await apiClient('api/MicroDiscussionForumAPI/AdminGetMicroCourseManyDiscussionForumQuestionsList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseAdminGetMicroCourseManyDiscussionForumQuestionsListErrorOutput(response.data, response.status);
        }

        const outputDto = parseAdminGetMicroCourseManyDiscussionForumQuestionsListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in adminGetMicroCourseManyDiscussionForumQuestionsList:', error);
        return parseAdminGetMicroCourseManyDiscussionForumQuestionsListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches replies for a specific discussion question in admin micro course.
 * API: POST /api/MicroDiscussionForumAPI/AdminGetMicroCourseManyDiscussionQuestionReplyList
 * 
 * @param {number} [discussionQuestionId=0] - Discussion question ID
 * @returns {Promise<object>} Parsed output containing `{ success, getMicroCourseManyDiscussionQuestionReply, message, status, rawData }`
 */
export async function adminGetMicroCourseManyDiscussionQuestionReplyList(discussionQuestionId = 0) {
    try {
        const inputDto = buildAdminGetMicroCourseManyDiscussionQuestionReplyListInput(discussionQuestionId);
        const response = await apiClient('api/MicroDiscussionForumAPI/AdminGetMicroCourseManyDiscussionQuestionReplyList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseAdminGetMicroCourseManyDiscussionQuestionReplyListErrorOutput(response.data, response.status);
        }

        const outputDto = parseAdminGetMicroCourseManyDiscussionQuestionReplyListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in adminGetMicroCourseManyDiscussionQuestionReplyList:', error);
        return parseAdminGetMicroCourseManyDiscussionQuestionReplyListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Deletes a discussion forum question in admin micro course.
 * API: POST /api/MicroDiscussionForumAPI/DeleteMicroManyDiscussionForumQuestions
 * 
 * @param {number} [microCourseDiscussionQuestionId=0] - Micro course discussion question ID
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function deleteMicroManyDiscussionForumQuestions(microCourseDiscussionQuestionId = 0, adminId = 1) {
    try {
        const inputDto = buildDeleteMicroManyDiscussionForumQuestionsInput(microCourseDiscussionQuestionId, adminId);
        const response = await apiClient('api/MicroDiscussionForumAPI/DeleteMicroManyDiscussionForumQuestions', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDeleteMicroManyDiscussionForumQuestionsErrorOutput(response.data, response.status);
        }

        const outputDto = parseDeleteMicroManyDiscussionForumQuestionsOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in deleteMicroManyDiscussionForumQuestions:', error);
        return parseDeleteMicroManyDiscussionForumQuestionsErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Deletes a discussion forum reply in admin micro course.
 * API: POST /api/MicroDiscussionForumAPI/DeleteMicroManyDiscussionForumeReply
 * 
 * @param {number} [microCourseDiscussionReplyId=0] - Micro course discussion reply ID
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function deleteMicroManyDiscussionForumeReply(microCourseDiscussionReplyId = 0, adminId = 1) {
    try {
        const inputDto = buildDeleteMicroManyDiscussionForumeReplyInput(microCourseDiscussionReplyId, adminId);
        const response = await apiClient('api/MicroDiscussionForumAPI/DeleteMicroManyDiscussionForumeReply', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDeleteMicroManyDiscussionForumeReplyErrorOutput(response.data, response.status);
        }

        const outputDto = parseDeleteMicroManyDiscussionForumeReplyOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in deleteMicroManyDiscussionForumeReply:', error);
        return parseDeleteMicroManyDiscussionForumeReplyErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches single discussion question list for microcredential courses with pagination and search.
 * API: POST /api/MicroDiscussionForumAPI/GetMicrocredentialSingleDiscussionQuestionList
 * 
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='MicroCourseId'] - Column to order by
 * @param {string} [orderByDirection='DESC'] - Sort direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @param {number} [adminId=1] - Admin identifier
 * @param {string} [searchInput=''] - Search term
 * @returns {Promise<object>} Parsed output containing `{ success, getMicrocredentialSingleDiscussionQuestionList, pageDetail, message, status, rawData }`
 */
export async function getMicrocredentialSingleDiscussionQuestionList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'MicroCourseId',
    orderByDirection = 'DESC',
    totalRecords = 0,
    adminId = 1,
    searchInput = ''
) {
    try {
        const inputDto = buildGetMicrocredentialSingleDiscussionQuestionListInput(
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            totalRecords,
            adminId,
            searchInput
        );
        const response = await apiClient('api/MicroDiscussionForumAPI/GetMicrocredentialSingleDiscussionQuestionList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialSingleDiscussionQuestionListErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicrocredentialSingleDiscussionQuestionListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicrocredentialSingleDiscussionQuestionList:', error);
        return parseGetMicrocredentialSingleDiscussionQuestionListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Inserts a single discussion reply for a student question.
 * API: POST /api/MicroDiscussionForumAPI/InsertMicroSingleDiscussionReply
 * 
 * @param {object} [replyData={}] - Object containing adminId, studentId, microSingleDiscussionQuestionId, reply, microCourseId
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function insertMicroSingleDiscussionReply(replyData = {}) {
    try {
        const inputDto = buildInsertMicroSingleDiscussionReplyInput(replyData);
        const response = await apiClient('api/MicroDiscussionForumAPI/InsertMicroSingleDiscussionReply', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseInsertMicroSingleDiscussionReplyErrorOutput(response.data, response.status);
        }

        const outputDto = parseInsertMicroSingleDiscussionReplyOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in insertMicroSingleDiscussionReply:', error);
        return parseInsertMicroSingleDiscussionReplyErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches student discussion questions for single discussion in microcredentials.
 * API: POST /api/MicroDiscussionForumAPI/GetMicrocredentialSingleDiscussionStudentQuestion
 * 
 * @param {number} [studentId=0] - Student ID
 * @param {number} [microCourseId=0] - Micro Course ID
 * @returns {Promise<object>} Parsed output containing `{ success, getMicrocredentialSingleDiscussionStudentQuestionList, message, status, rawData }`
 */
export async function getMicrocredentialSingleDiscussionStudentQuestion(studentId = 0, microCourseId = 0) {
    try {
        const inputDto = buildGetMicrocredentialSingleDiscussionStudentQuestionInput(studentId, microCourseId);
        const response = await apiClient('api/MicroDiscussionForumAPI/GetMicrocredentialSingleDiscussionStudentQuestion', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialSingleDiscussionStudentQuestionErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicrocredentialSingleDiscussionStudentQuestionOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicrocredentialSingleDiscussionStudentQuestion:', error);
        return parseGetMicrocredentialSingleDiscussionStudentQuestionErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches admin student review list for microcredential courses with pagination and search.
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialStudentReviewList
 * 
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='MicrocredentialCourseReviewId'] - Column to order by
 * @param {string} [orderByDirection='DESC'] - Sort direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @param {number} [adminId=1] - Admin identifier
 * @param {string} [searchInput=''] - Search term
 * @returns {Promise<object>} Parsed output containing `{ success, getMicrocredentialStudentReviews, pageDetail, message, status, rawData }`
 */
export async function getMicrocredentialStudentReviewList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'MicrocredentialCourseReviewId',
    orderByDirection = 'DESC',
    totalRecords = 0,
    adminId = 1,
    searchInput = ''
) {
    try {
        const inputDto = buildGetMicrocredentialStudentReviewListInput(
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            totalRecords,
            adminId,
            searchInput
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialStudentReviewList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialStudentReviewListErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicrocredentialStudentReviewListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicrocredentialStudentReviewList:', error);
        return parseGetMicrocredentialStudentReviewListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Deletes a student review for a microcredential course.
 * API: POST /api/IgnitoMicroCredencialAPI/DeleteMicrocredentialStudentReview
 * 
 * @param {number} [microcredentialCourseReviewId=0] - Microcredential course review ID
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output containing `{ success, message, status, errorDescription, rawData }`
 */
export async function deleteMicrocredentialStudentReview(microcredentialCourseReviewId = 0, adminId = 1) {
    try {
        const inputDto = buildDeleteMicrocredentialStudentReviewInput(microcredentialCourseReviewId, adminId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/DeleteMicrocredentialStudentReview', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDeleteMicrocredentialStudentReviewErrorOutput(response.data, response.status);
        }

        const outputDto = parseDeleteMicrocredentialStudentReviewOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in deleteMicrocredentialStudentReview:', error);
        return parseDeleteMicrocredentialStudentReviewErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Logs client-side JavaScript error to backend.
 * API: POST /api/ErrorLogAPI/LogJsError
 * 
 * @param {string} errorMessage - Error description
 * @param {string} [errorStack=''] - Stack trace
 * @param {string} [errorSource=''] - Source file/action
 * @param {number} [adminId=1] - Admin ID
 * @param {number} [studentId=0] - Student ID
 * @returns {Promise<object>} Response
 */
export async function logJsError(errorMessage, errorStack = '', errorSource = '', adminId = 1, studentId = 0) {
    try {
        const response = await apiClient('api/ErrorLogAPI/LogJsError', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ErrorMessage: errorMessage || 'Unknown Error',
                ErrorStack: errorStack || 'No stack trace available',
                ErrorSource: errorSource || 'React Admin Panel',
                AdminId: Number(adminId || 1),
                StudentId: Number(studentId || 0)
            })
        });
        return response.data;
    } catch (err) {
        console.warn('Could not log JS error to backend:', err);
    }
}

/**
 * Downloads Excel template for Microcredential Course Topics.
 * API: POST /api/IgnitoMicroCredencialAPI/DownloadMicroTopicTemplate
 * 
 * @param {string} stream - Stream name (e.g. 'Computer Science & IT')
 * @param {string} microCourseName - Course name (e.g. 'Advanced Machine Learning')
 * @param {string} [uploadMicroDocument=''] - Existing micro document path if any
 * @param {boolean} [autoDownload=true] - Trigger browser download
 * @returns {Promise<object>}
 */
export async function downloadMicroTopicTemplate(
    stream = '',
    microCourseName = '',
    uploadMicroDocument = '',
    autoDownload = true
) {
    try {
        const payload = {
            Stream: stream,
            MicroCourseName: microCourseName,
            UploadMicroDocument: uploadMicroDocument
        };

        const response = await apiClient('api/IgnitoMicroCredencialAPI/DownloadMicroTopicTemplate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*'
            },
            body: JSON.stringify(payload),
            responseType: 'blob'
        });

        if (!response.ok && response.status !== 200) {
            return {
                success: false,
                status: response.status,
                message: 'Failed to download topic template'
            };
        }

        const blob = response.data;
        const sanitizedCourse = (microCourseName || 'MicroCourse').replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${sanitizedCourse}_Micro_Topic_Template.xlsx`;

        if (autoDownload && blob) {
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        }

        return {
            success: true,
            status: response.status,
            blob,
            fileName
        };
    } catch (error) {
        console.error('Error in downloadMicroTopicTemplate:', error);
        return {
            success: false,
            status: 500,
            message: error.message || 'Error downloading topic template'
        };
    }
}

/**
 * Uploads Microcredential Course Topic Excel File for parsing.
 * API: POST /api/IgnitoMicroCredencialAPI/UploadMicroTopicExcel
 * 
 * @param {File} file - Excel file (.xlsx, .xls)
 * @returns {Promise<object>}
 */
export async function uploadMicroTopicExcel(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient('api/IgnitoMicroCredencialAPI/UploadMicroTopicExcel', {
            method: 'POST',
            body: formData
        });

        if (!response.ok && response.status !== 200) {
            return {
                success: false,
                status: response.status,
                message: response.data?.message || 'Failed to upload topic excel'
            };
        }

        const data = response.data || {};
        return {
            success: Boolean(data.isSuccess ?? true),
            message: data.message || 'File processed successfully.',
            stream: data.stream || '',
            microcredentialCourse: data.microcredentialCourse || '',
            uploadMicroDocument: data.uploadMicroDocument || '',
            microCourseExcelTopicList: data.microCourseExcelTopicList || [],
            rawData: data
        };
    } catch (error) {
        console.error('Error in uploadMicroTopicExcel:', error);
        return {
            success: false,
            status: 500,
            message: error.message || 'Error uploading topic excel'
        };
    }
}

/**
 * Inserts Bulk Microcredential Course Topics from Excel.
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialCourseTopicExcelInsert
 * 
 * @param {object} data - { AdminId, Stream, MicrocredentialCourse, UploadMicroDocument, MicroCourseExcelTopicList }
 * @returns {Promise<object>}
 */
export async function microcredentialCourseTopicExcelInsert(data = {}) {
    try {
        const payload = {
            AdminId: Number(data.AdminId ?? data.adminId ?? 1),
            Stream: data.Stream || data.stream || '',
            MicrocredentialCourse: data.MicrocredentialCourse || data.microcredentialCourse || '',
            UploadMicroDocument: data.UploadMicroDocument || data.uploadMicroDocument || '',
            MicroCourseExcelTopicList: (data.MicroCourseExcelTopicList || data.microCourseExcelTopicList || []).map(item => ({
                topicName: item.topicName || item.TopicName || '',
                videoTitle: item.videoTitle || item.VideoTitle || '',
                topicVideoUrl: item.topicVideoUrl || item.TopicVideoUrl || '',
                topicPdf: item.topicPdf || item.TopicPdf || ''
            }))
        };

        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialCourseTopicExcelInsert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok && response.status !== 200) {
            return {
                success: false,
                status: response.status,
                message: response.data?.message || 'Failed to insert topic excel data'
            };
        }

        const resData = response.data || {};
        return {
            success: Boolean(resData.isSuccess ?? true),
            message: resData.message || 'Micro Course Topic added successfully!',
            rawData: resData
        };
    } catch (error) {
        console.error('Error in microcredentialCourseTopicExcelInsert:', error);
        return {
            success: false,
            status: 500,
            message: error.message || 'Error inserting topic excel data'
        };
    }
}

/**
 * Downloads a file from a URL by fetching its blob and triggering an anchor click with the download attribute.
 * This guarantees a local download even for cross-origin URLs where standard `<a download>` is ignored.
 *
 * @param {string} fileUrl - Absolute or relative URL of the file
 * @param {string} [customFileName=""] - Desired downloaded filename
 */
export async function downloadFileFromUrl(fileUrl, customFileName = "") {
    if (!fileUrl) return;

    try {
        let fetchUrl = fileUrl;
        if (fetchUrl.startsWith("http://") || fetchUrl.startsWith("https://")) {
            try {
                const urlObj = new URL(fetchUrl);
                if (
                    urlObj.hostname === "verse.ignitolearn.com" ||
                    urlObj.hostname === window.location.hostname
                ) {
                    fetchUrl = urlObj.pathname + urlObj.search;
                }
            } catch {
                // keep fetchUrl
            }
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`Failed to download file (HTTP ${response.status})`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const fileName =
            customFileName ||
            fileUrl.split("/").pop()?.split("?")[0] ||
            "downloaded_document.pdf";

        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("Error in downloadFileFromUrl:", error);
        const fallbackLink = document.createElement("a");
        fallbackLink.href = fileUrl;
        fallbackLink.target = "_blank";
        fallbackLink.rel = "noopener noreferrer";
        fallbackLink.setAttribute("download", customFileName || fileUrl.split("/").pop() || "document.pdf");
        document.body.appendChild(fallbackLink);
        fallbackLink.click();
        fallbackLink.remove();
    }
}

/**
 * Add / Update Microcredential Module (Single or Bulk)
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterAddUpdate
 * 
 * @param {object} moduleData - Module data or bulk object
 * @returns {Promise<object>} Result DTO `{ success, status, message, rawData }`
 */
export async function microcredentialModuleMasterAddUpdate(moduleData = {}) {
    try {
        const inputDto = buildMicrocredentialModuleMasterAddUpdateInput(moduleData);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterAddUpdate', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialModuleMasterAddUpdateErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicrocredentialModuleMasterAddUpdateOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microcredentialModuleMasterAddUpdate:', error);
        return parseMicrocredentialModuleMasterAddUpdateErrorOutput({ message: error.message }, 500);
    }
}

/**
 * List Microcredential Modules (Paginated and searchable)
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterList
 * 
 * @param {number} [pageNo=1]
 * @param {number} [pageSize=10]
 * @param {string} [orderByColumn='UpdatedOn']
 * @param {string} [orderByDirection='DESC']
 * @param {string} [whereClause='']
 * @param {number} [adminId=1]
 * @returns {Promise<object>} Result DTO `{ success, microcredentialModuleMasterList, pageDetail, ... }`
 */
export async function microcredentialModuleMasterList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'UpdatedOn',
    orderByDirection = 'DESC',
    whereClause = '',
    adminId = 1
) {
    try {
        const inputDto = buildMicrocredentialModuleMasterListInput(
            adminId,
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            whereClause
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialModuleMasterListErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicrocredentialModuleMasterListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microcredentialModuleMasterList:', error);
        return parseMicrocredentialModuleMasterListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Get Microcredential Module By ID
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterGetById
 * 
 * @param {number} microcredentialModuleMasterId
 * @returns {Promise<object>} Result DTO `{ success, module, ... }`
 */
export async function microcredentialModuleMasterGetById(microcredentialModuleMasterId = 0) {
    try {
        const inputDto = buildMicrocredentialModuleMasterGetByIdInput(microcredentialModuleMasterId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterGetById', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialModuleMasterGetByIdErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicrocredentialModuleMasterGetByIdOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microcredentialModuleMasterGetById:', error);
        return parseMicrocredentialModuleMasterGetByIdErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Delete Microcredential Module
 * API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterDelete
 * 
 * @param {number} microcredentialModuleMasterId
 * @param {number} [adminId=1]
 * @returns {Promise<object>} Result DTO `{ success, message, ... }`
 */
export async function microcredentialModuleMasterDelete(microcredentialModuleMasterId = 0, adminId = 1) {
    try {
        const inputDto = buildMicrocredentialModuleMasterDeleteInput(adminId, microcredentialModuleMasterId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialModuleMasterDelete', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialModuleMasterDeleteErrorOutput(response.data, response.status);
        }

        const outputDto = parseMicrocredentialModuleMasterDeleteOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in microcredentialModuleMasterDelete:', error);
        return parseMicrocredentialModuleMasterDeleteErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Get Modules By Course ID (Used for dropdowns & module navigation)
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialModuleByCourseId
 * 
 * @param {number} microcredentialCourseId
 * @returns {Promise<object>} Result DTO `{ success, microcredentialModuleList, ... }`
 */
export async function getMicrocredentialModuleByCourseId(microcredentialCourseId = 0) {
    try {
        const inputDto = buildGetMicrocredentialModuleByCourseIdInput(microcredentialCourseId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialModuleByCourseId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialModuleByCourseIdErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicrocredentialModuleByCourseIdOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicrocredentialModuleByCourseId:', error);
        return parseGetMicrocredentialModuleByCourseIdErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Get Topics By Module ID (Used for module-wise topic view)
 * API: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialTopicByModuleId
 * 
 * @param {number} microcredentialModuleMasterId
 * @returns {Promise<object>} Result DTO `{ success, microcredentialTopicList, ... }`
 */
export async function getMicrocredentialTopicByModuleId(microcredentialModuleMasterId = 0) {
    try {
        const inputDto = buildGetMicrocredentialTopicByModuleIdInput(microcredentialModuleMasterId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialTopicByModuleId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialTopicByModuleIdErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetMicrocredentialTopicByModuleIdOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getMicrocredentialTopicByModuleId:', error);
        return parseGetMicrocredentialTopicByModuleIdErrorOutput({ message: error.message }, 500);
    }
}

// Re-export getMicroCourseTopicDetail and getMicrocredentialCourseDetail for unified access
export { getMicroCourseTopicDetail, getMicrocredentialCourseDetail } from './microcredentialService';


