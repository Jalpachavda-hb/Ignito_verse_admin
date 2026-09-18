/**
 * ADMIN QUIZ PAGE SERVICE
 * Comprehensive API service connecting React Admin UI with backend .NET Web API
 * for both Degree/Microcredential Quiz and Microcredential AI Video Checkpoint Quizzes.
 *
 * Implements dynamic admin session ID extraction from localStorage (`ignito_admin_id` and `ignito_auth_user`),
 * complete input builders, output parsers, and error handling.
 */

import { apiClient } from './apiClient';

// Inputs
import {
    buildMainDegreeQuizListInput,
    buildActiveInactiveDegreeQuizInput,
    buildDeleteDegreeQuizByQuizIdInput,
    buildGetEducationTypeInput,
    buildGetStreamByProgrammeInput,
    buildDegreeQuizMasterAddUpdateInput,
    buildGetDegreeQuizDetailsByQuizIdInput,
    buildFinalizeDegreeQuizAddUpdateInput,
    buildDegreeQuizQuestionsListInput,
    buildActiveInactiveDegreeQuizQuestionsInput,
    buildDeleteDegreeQuizQuestionsInput,
    buildDegreeQuizQuestionMasterAddUpdateInput,
    buildGetDegreeStudentsForSpecialQuizAccessInput,
    buildMicrocredentialQuizCategoryListInput,
    buildGetMicroCourseCheckpointQuizTopicDetailInput,
    buildGetMicrocredentialCheckpointQuizDataInput,
    buildDeleteMicrocredentialCheckpointQuizByYoutubeDataMasterIdInput,
    buildDeleteMicrocredentialCheckpointQuizByCourseIdInput,
    buildGetMicrocredentialVideoDetailsByCourseIdInput,
    buildGenerateMicrocredentialCheckpointQuizInput,
    buildGetMicrocredentialCheckpointQuizReportInput,
    buildGetStudentMicrocredentialQuizResponseInput,
    buildDegreeQuizPreviewGetByQuizIdInput
} from '../dto/input/adminQuizInputs';

import { buildGetStreamDataInput } from '../dto/input/getStreamDataInput';
import { buildGetMicrocredentialCourseInput } from '../dto/input/getMicrocredentialCourseInput';
import { buildMicroCourseTopicListInput } from '../dto/input/microCourseTopicListInput';
import { buildGetMicrocredentialStudentDownloadDocumentsInput } from '../dto/input/getMicrocredentialStudentDownloadDocumentsInput';
import { getMicrocredentialModuleByCourseId } from './adminMicrocredentialService';

// Outputs
import {
    parseMainDegreeQuizListOutput,
    parseMainDegreeQuizListErrorOutput,
    parseActiveInactiveDegreeQuizOutput,
    parseActiveInactiveDegreeQuizErrorOutput,
    parseDeleteDegreeQuizByQuizIdOutput,
    parseDeleteDegreeQuizByQuizIdErrorOutput,
    parseGetEducationTypeOutput,
    parseGetEducationTypeErrorOutput,
    parseGetStreamByProgrammeOutput,
    parseGetStreamByProgrammeErrorOutput,
    parseDegreeQuizMasterAddUpdateOutput,
    parseDegreeQuizMasterAddUpdateErrorOutput,
    parseGetDegreeQuizDetailsByQuizIdOutput,
    parseGetDegreeQuizDetailsByQuizIdErrorOutput,
    parseFinalizeDegreeQuizAddUpdateOutput,
    parseFinalizeDegreeQuizAddUpdateErrorOutput,
    parseDegreeQuizQuestionsListOutput,
    parseDegreeQuizQuestionsListErrorOutput,
    parseDegreeQuizQuestionMasterAddUpdateOutput,
    parseDegreeQuizQuestionMasterAddUpdateErrorOutput,
    parseDegreeQuizQuestionActionOutput,
    parseDegreeQuizQuestionActionErrorOutput,
    parseGetDegreeStudentsForSpecialQuizAccessOutput,
    parseGetDegreeStudentsForSpecialQuizAccessErrorOutput,
    parseMicrocredentialQuizCategoryListOutput,
    parseMicrocredentialQuizCategoryListErrorOutput,
    parseGetMicroCourseCheckpointQuizTopicDetailOutput,
    parseGetMicroCourseCheckpointQuizTopicDetailErrorOutput,
    parseGetMicrocredentialCheckpointQuizDataOutput,
    parseGetMicrocredentialCheckpointQuizDataErrorOutput,
    parseDeleteMicrocredentialCheckpointQuizOutput,
    parseDeleteMicrocredentialCheckpointQuizErrorOutput,
    parseGetMicrocredentialVideoDetailsByCourseIdOutput,
    parseGetMicrocredentialVideoDetailsByCourseIdErrorOutput,
    parseGenerateMicrocredentialCheckpointQuizOutput,
    parseGenerateMicrocredentialCheckpointQuizErrorOutput,
    parseGetMicrocredentialCheckpointQuizReportOutput,
    parseGetMicrocredentialCheckpointQuizReportErrorOutput,
    parseGetStudentMicrocredentialQuizResponseOutput,
    parseGetStudentMicrocredentialQuizResponseErrorOutput,
    parseDegreeQuizPreviewGetByQuizIdOutput,
    parseDegreeQuizPreviewGetByQuizIdErrorOutput
} from '../dto/output/adminQuizOutputs';

import { parseGetStreamDataOutput, parseGetStreamDataErrorOutput } from '../dto/output/getStreamDataOutput';
import { parseGetMicrocredentialCourseOutput, parseGetMicrocredentialCourseErrorOutput } from '../dto/output/getMicrocredentialCourseOutput';
import { parseMicroCourseTopicListOutput, parseMicroCourseTopicListErrorOutput } from '../dto/output/microCourseTopicListOutput';
import { parseGetMicrocredentialStudentDownloadDocumentsOutput, parseGetMicrocredentialStudentDownloadDocumentsErrorOutput } from '../dto/output/getMicrocredentialStudentDownloadDocumentsOutput';

import {
    fetchMicrocredentialQuizStudentResultList,
    getMicrocredentialQuizStudentAttemptList,
    getStudentMicrocredentialQuizResultGetByQuizId,
    getStudentMicrocredentialQuizResultByAttempt
} from './microcredentialQuizResultService';

// =============================================================================
// STORAGE KEYS & DYNAMIC ADMIN ID HELPER
// =============================================================================

const STORAGE_ADMIN_ID_KEY = 'ignito_admin_id';
const STORAGE_USER_KEY = 'ignito_auth_user';

/**
 * Retrieves the currently logged-in administrator ID dynamically from localStorage.
 * First checks `ignito_admin_id`, then parses `ignito_auth_user`, defaulting to 1.
 *
 * @returns {number} Active admin ID
 */
export function getLoggedInAdminId() {
    try {
        const storedAdminId = localStorage.getItem(STORAGE_ADMIN_ID_KEY);
        if (storedAdminId && !isNaN(Number(storedAdminId)) && Number(storedAdminId) > 0) {
            return Number(storedAdminId);
        }

        const rawUser = localStorage.getItem(STORAGE_USER_KEY);
        if (rawUser) {
            const user = JSON.parse(rawUser);
            const userAdminId = user?.adminId ?? user?.AdminId ?? user?.id ?? user?.Id;
            if (userAdminId && !isNaN(Number(userAdminId)) && Number(userAdminId) > 0) {
                return Number(userAdminId);
            }
        }
    } catch (err) {
        console.warn('Error reading admin ID from localStorage:', err);
    }
    return 1;
}

/**
 * Resolves an explicit or dynamic admin ID.
 * @param {number|string} [overrideAdminId]
 * @returns {number}
 */
function resolveAdminId(overrideAdminId) {
    if (overrideAdminId !== undefined && overrideAdminId !== null && !isNaN(Number(overrideAdminId)) && Number(overrideAdminId) > 0) {
        return Number(overrideAdminId);
    }
    return getLoggedInAdminId();
}

// =============================================================================
// SECTION 1: MICROCREDENTIAL QUIZ LIST (MicrocredentialQuizList.js)
// =============================================================================

/**
 * 1.1 Fetch Paginated Microcredential Quiz List
 * Endpoint: POST /api/DegreeQuizAPI/MainDegreeQuizList
 *
 * @param {object} [params={}] - Filter & pagination options:
 *   { pageNo, pageSize, orderByColumn, orderByDirection, searchInput, educationTypeId, quizTitle, stream, microcredentialName, quizCreaterName, dueDate, adminId }
 * @returns {Promise<object>} Formatted quiz list with pagination
 */
export async function fetchPaginatedMicrocredentialQuizList(params = {}) {
    try {
        const adminId = resolveAdminId(params?.adminId ?? params?.AdminId);
        const inputDto = buildMainDegreeQuizListInput({ ...params, adminId });

        const response = await apiClient('api/DegreeQuizAPI/MainDegreeQuizList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMainDegreeQuizListErrorOutput(response.data, response.status);
        }

        return parseMainDegreeQuizListOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in fetchPaginatedMicrocredentialQuizList:', error);
        return parseMainDegreeQuizListErrorOutput({ message: error.message }, 500);
    }
}

// Alias for convenience
export const mainDegreeQuizList = fetchPaginatedMicrocredentialQuizList;

/**
 * 1.2 Toggle Quiz Active / Inactive Status
 * Endpoint: POST /api/DegreeQuizAPI/ActiveInactiveDegreeQuiz
 *
 * @param {number|object} quizIdOrParams - Quiz ID or parameter object
 * @param {boolean} [isActive=false] - Target active state
 * @param {number} [adminId] - Admin ID (optional, defaults to logged-in admin)
 * @returns {Promise<object>} Response status & message
 */
export async function toggleQuizActiveInactiveStatus(quizIdOrParams, isActive = false, adminId) {
    try {
        const params = typeof quizIdOrParams === 'object' && quizIdOrParams !== null
            ? quizIdOrParams
            : { quizId: quizIdOrParams, isActive, adminId };

        const resolvedId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildActiveInactiveDegreeQuizInput({ ...params, adminId: resolvedId });

        const response = await apiClient('api/DegreeQuizAPI/ActiveInactiveDegreeQuiz', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseActiveInactiveDegreeQuizErrorOutput(response.data, response.status);
        }

        return parseActiveInactiveDegreeQuizOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in toggleQuizActiveInactiveStatus:', error);
        return parseActiveInactiveDegreeQuizErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const activeInactiveDegreeQuiz = toggleQuizActiveInactiveStatus;

/**
 * 1.3 Delete Quiz by Quiz ID
 * Endpoint: POST /api/DegreeQuizAPI/DeleteDegreeQuizByQuizId
 *
 * @param {number|object} quizIdOrParams - Quiz ID or parameter object
 * @param {number} [adminId] - Admin ID (optional)
 * @returns {Promise<object>} Response status & message
 */
export async function deleteQuizByQuizId(quizIdOrParams, adminId) {
    try {
        const params = typeof quizIdOrParams === 'object' && quizIdOrParams !== null
            ? quizIdOrParams
            : { quizId: quizIdOrParams, adminId };

        const resolvedId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildDeleteDegreeQuizByQuizIdInput({ ...params, adminId: resolvedId });

        const response = await apiClient('api/DegreeQuizAPI/DeleteDegreeQuizByQuizId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDeleteDegreeQuizByQuizIdErrorOutput(response.data, response.status);
        }

        return parseDeleteDegreeQuizByQuizIdOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in deleteQuizByQuizId:', error);
        return parseDeleteDegreeQuizByQuizIdErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const deleteDegreeQuizByQuizId = deleteQuizByQuizId;

// =============================================================================
// SECTION 2: ADD / EDIT MICROCREDENTIAL QUIZ (AddMicrocredentialQuiz.js)
// =============================================================================

/**
 * 2.1 Get Education Type List
 * Endpoint: POST /api/AdminCommonAPI/GetEducationType
 *
 * @returns {Promise<object>} Education types list
 */
export async function getEducationType() {
    try {
        const inputDto = buildGetEducationTypeInput();
        const response = await apiClient('api/AdminCommonAPI/GetEducationType', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetEducationTypeErrorOutput(response.data, response.status);
        }

        return parseGetEducationTypeOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getEducationType:', error);
        return parseGetEducationTypeErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 2.2 Get Streams Dropdown Data
 * Endpoint: POST /api/AdminSetUpAPI/GetStreamData
 *
 * @returns {Promise<object>} Stream options list
 */
export async function getStreamsDropdown() {
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

        return parseGetStreamDataOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getStreamsDropdown:', error);
        return parseGetStreamDataErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const getStreamData = getStreamsDropdown;

/**
 * 2.3 Get Programmes by Stream
 * Endpoint: POST /api/ProgramAPI/GetStreamByProgramme
 *
 * @param {number|string|object} streamIdOrParams - Stream ID or object
 * @returns {Promise<object>} Programmes list
 */
export async function getProgrammesByStream(streamIdOrParams) {
    try {
        const inputDto = buildGetStreamByProgrammeInput(streamIdOrParams);
        const response = await apiClient('api/ProgramAPI/GetStreamByProgramme', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetStreamByProgrammeErrorOutput(response.data, response.status);
        }

        return parseGetStreamByProgrammeOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getProgrammesByStream:', error);
        return parseGetStreamByProgrammeErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const getStreamByProgramme = getProgrammesByStream;

/**
 * 2.4 Get Microcredential Courses by Stream
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCourse
 *
 * @param {number|string|object} streamIdOrParams - Stream ID
 * @returns {Promise<object>} Microcredential courses list
 */
export async function getMicrocredentialCoursesByStream(streamIdOrParams) {
    try {
        const streamId = typeof streamIdOrParams === 'object' && streamIdOrParams !== null
            ? (streamIdOrParams.streamId ?? streamIdOrParams.StreamId ?? '')
            : streamIdOrParams;

        const inputDto = buildGetMicrocredentialCourseInput(streamId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialCourse', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialCourseErrorOutput(response.data, response.status);
        }

        return parseGetMicrocredentialCourseOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicrocredentialCoursesByStream:', error);
        return parseGetMicrocredentialCourseErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const getMicrocredentialCourse = getMicrocredentialCoursesByStream;

/**
 * 2.5 Add / Update Quiz Master (Step 1)
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizMasterAddUpdate
 *
 * @param {object} params - Quiz Master data:
 *   { QuizId, QuizTitle, GradeOutOf, DueDate, QuizDescription, EducationTypeId, StreamId, ProgramId,
 *     SemesterId, CourseDetailsId, UnitId, GradeScheme, GradeBook, YearRange, CreatedBy, MicrocredentialCourseId }
 * @returns {Promise<object>} Result containing quizId and status message
 */
export async function saveDegreeQuizMaster(params = {}) {
    try {
        const createdBy = resolveAdminId(params.createdBy ?? params.CreatedBy ?? params.adminId ?? params.AdminId);
        const inputDto = buildDegreeQuizMasterAddUpdateInput({ ...params, createdBy });

        const response = await apiClient('api/DegreeQuizAPI/DegreeQuizMasterAddUpdate', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDegreeQuizMasterAddUpdateErrorOutput(response.data, response.status);
        }

        return parseDegreeQuizMasterAddUpdateOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in saveDegreeQuizMaster:', error);
        return parseDegreeQuizMasterAddUpdateErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const degreeQuizMasterAddUpdate = saveDegreeQuizMaster;

/**
 * 2.5B Get Degree Quiz Details by Quiz ID
 * Endpoint: POST /api/DegreeQuizAPI/GetDegreeQuizDetailsByQuizId
 *
 * @param {number|object} quizIdOrParams - Quiz ID or object
 * @returns {Promise<object>} Quiz details including MicrocredentialModuleMasterId and ModuleName
 */
export async function getDegreeQuizDetailsByQuizId(quizIdOrParams) {
    try {
        const inputDto = buildGetDegreeQuizDetailsByQuizIdInput(quizIdOrParams);
        const response = await apiClient('api/DegreeQuizAPI/GetDegreeQuizDetailsByQuizId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetDegreeQuizDetailsByQuizIdErrorOutput(response.data, response.status);
        }

        return parseGetDegreeQuizDetailsByQuizIdOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getDegreeQuizDetailsByQuizId:', error);
        return parseGetDegreeQuizDetailsByQuizIdErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 2.6 Finalize Quiz & Save Settings (Save & Close)
 * Endpoint: POST /api/DegreeQuizAPI/FinalizeDegreeQuizAddUpdate
 *
 * @param {object} params - Complete quiz availability, timing, IP restrictions, evaluation settings
 * @returns {Promise<object>} Result containing fcm tokens and status message
 */
export async function finalizeDegreeQuiz(params = {}) {
    try {
        const adminId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildFinalizeDegreeQuizAddUpdateInput({ ...params, adminId });

        const response = await apiClient('api/DegreeQuizAPI/FinalizeDegreeQuizAddUpdate', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseFinalizeDegreeQuizAddUpdateErrorOutput(response.data, response.status);
        }

        return parseFinalizeDegreeQuizAddUpdateOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in finalizeDegreeQuiz:', error);
        return parseFinalizeDegreeQuizAddUpdateErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const finalizeDegreeQuizAddUpdate = finalizeDegreeQuiz;

/**
 * 2.7 Get Questions List for Quiz (Step 2 Question Table)
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizQuestionsList
 *
 * @param {object} params - { quizId, pageNo, pageSize, orderByColumn, orderByDirection, searchInput, adminId }
 * @returns {Promise<object>} Questions list with pageDetail & totalPoints
 */
export async function getDegreeQuizQuestionsList(params = {}) {
    try {
        const adminId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildDegreeQuizQuestionsListInput({ ...params, adminId });

        const response = await apiClient('api/DegreeQuizAPI/DegreeQuizQuestionsList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDegreeQuizQuestionsListErrorOutput(response.data, response.status);
        }

        return parseDegreeQuizQuestionsListOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getDegreeQuizQuestionsList:', error);
        return parseDegreeQuizQuestionsListErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const degreeQuizQuestionsList = getDegreeQuizQuestionsList;

/**
 * 2.8 Toggle Active/Inactive Status of Question
 * Endpoint: POST /api/DegreeQuizAPI/ActiveInactiveDegreeQuizQuestions
 *
 * @param {number|object} quizIdOrParams - Quiz ID or options object
 * @param {number} [questionId] - Question ID
 * @param {boolean} [isActive=false] - Active state
 * @param {number} [adminId] - Admin ID
 * @returns {Promise<object>} Result message
 */
export async function toggleDegreeQuizQuestionStatus(quizIdOrParams, questionId, isActive = false, adminId) {
    try {
        const params = typeof quizIdOrParams === 'object' && quizIdOrParams !== null
            ? quizIdOrParams
            : { quizId: quizIdOrParams, questionId, isActive, adminId };

        const resolvedId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildActiveInactiveDegreeQuizQuestionsInput({ ...params, adminId: resolvedId });

        const response = await apiClient('api/DegreeQuizAPI/ActiveInactiveDegreeQuizQuestions', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDegreeQuizQuestionActionErrorOutput(response.data, response.status);
        }

        return parseDegreeQuizQuestionActionOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in toggleDegreeQuizQuestionStatus:', error);
        return parseDegreeQuizQuestionActionErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const activeInactiveDegreeQuizQuestions = toggleDegreeQuizQuestionStatus;

/**
 * 2.9 Delete Question from Quiz
 * Endpoint: POST /api/DegreeQuizAPI/DeleteDegreeQuizQuestions
 *
 * @param {number|object} quizIdOrParams - Quiz ID or options object
 * @param {number} [questionId] - Question ID
 * @param {number} [adminId] - Admin ID
 * @returns {Promise<object>} Result message
 */
export async function deleteDegreeQuizQuestion(quizIdOrParams, questionId, adminId) {
    try {
        const params = typeof quizIdOrParams === 'object' && quizIdOrParams !== null
            ? quizIdOrParams
            : { quizId: quizIdOrParams, questionId, adminId };

        const resolvedId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildDeleteDegreeQuizQuestionsInput({ ...params, adminId: resolvedId });

        const response = await apiClient('api/DegreeQuizAPI/DeleteDegreeQuizQuestions', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDegreeQuizQuestionActionErrorOutput(response.data, response.status);
        }

        return parseDegreeQuizQuestionActionOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in deleteDegreeQuizQuestion:', error);
        return parseDegreeQuizQuestionActionErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const deleteDegreeQuizQuestions = deleteDegreeQuizQuestion;

/**
 * 2.9B Add / Update Degree Quiz Question Master (Supports all 12 Question Types)
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizQuestionMasterAddUpdate
 *
 * @param {object} params - DegreeQuizQuestionMasterInputParameter
 * @returns {Promise<object>} Result containing questionId and status message
 */
export async function saveDegreeQuizQuestionMaster(params = {}) {
    try {
        const adminId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildDegreeQuizQuestionMasterAddUpdateInput({ ...params, adminId });

        const response = await apiClient('api/DegreeQuizAPI/DegreeQuizQuestionMasterAddUpdate', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDegreeQuizQuestionMasterAddUpdateErrorOutput(response.data, response.status);
        }

        return parseDegreeQuizQuestionMasterAddUpdateOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in saveDegreeQuizQuestionMaster:', error);
        return parseDegreeQuizQuestionMasterAddUpdateErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const degreeQuizQuestionMasterAddUpdate = saveDegreeQuizQuestionMaster;

/**
 * 2.10 Get Students for Special Quiz Access
 * Endpoint: POST /api/DegreeQuizAPI/GetDegreeStudentsForSpecialQuizAccess
 *
 * @param {object} params - { quizId, pageNo, pageSize, orderByColumn, orderByDirection, searchInput }
 * @returns {Promise<object>} Special access students list
 */
export async function getDegreeStudentsForSpecialQuizAccess(params = {}) {
    try {
        const inputDto = buildGetDegreeStudentsForSpecialQuizAccessInput(params);
        const response = await apiClient('api/DegreeQuizAPI/GetDegreeStudentsForSpecialQuizAccess', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetDegreeStudentsForSpecialQuizAccessErrorOutput(response.data, response.status);
        }

        return parseGetDegreeStudentsForSpecialQuizAccessOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getDegreeStudentsForSpecialQuizAccess:', error);
        return parseGetDegreeStudentsForSpecialQuizAccessErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 2.10B Get Degree Quiz Preview & Answer Key by Quiz ID
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizPerviewGetByQuizId
 *
 * @param {number|object} quizIdOrParams - Quiz ID or parameter object
 * @returns {Promise<object>} Complete quiz preview with questions and answer options
 */
export async function getDegreeQuizPreviewByQuizId(quizIdOrParams) {
    try {
        const inputDto = buildDegreeQuizPreviewGetByQuizIdInput(quizIdOrParams);
        const response = await apiClient('api/DegreeQuizAPI/DegreeQuizPerviewGetByQuizId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDegreeQuizPreviewGetByQuizIdErrorOutput(response.data, response.status);
        }

        return parseDegreeQuizPreviewGetByQuizIdOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getDegreeQuizPreviewByQuizId:', error);
        return parseDegreeQuizPreviewGetByQuizIdErrorOutput({ message: error.message }, 500);
    }
}

export const getDegreeQuizPerviewGetByQuizId = getDegreeQuizPreviewByQuizId;
export const getDegreeQuizPerviewByQuizId = getDegreeQuizPreviewByQuizId;


/**
 * 2.11 Get Microcredential Quiz Categories
 * Endpoint: POST /api/DegreeQuizAPI/MicrocredentialQuizCategoryList
 *
 * @returns {Promise<object>} Category options list
 */
export async function getMicrocredentialQuizCategoryList() {
    try {
        const inputDto = buildMicrocredentialQuizCategoryListInput();
        const response = await apiClient('api/DegreeQuizAPI/MicrocredentialQuizCategoryList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialQuizCategoryListErrorOutput(response.data, response.status);
        }

        return parseMicrocredentialQuizCategoryListOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicrocredentialQuizCategoryList:', error);
        return parseMicrocredentialQuizCategoryListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 2.12 Check Public IP (External Utility)
 * Endpoint: GET https://api.ipify.org?format=json
 *
 * @returns {Promise<{ ip: string }>} Public IP address object
 */
export async function checkPublicIpAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            return { ip: '' };
        }
        const data = await response.json();
        return { ip: data?.ip || '' };
    } catch (error) {
        console.warn('Error fetching public IP address:', error);
        return { ip: '' };
    }
}

// =============================================================================
// SECTION 3: CHECKPOINT QUIZ LIST (MicrocredentialCheckpointQuizList.js)
// =============================================================================

/**
 * 3.1 Fetch Microcredential Course Topics List
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicroCourseTopicList
 *
 * @param {object} [params={}] - { pageNo, pageSize, orderByColumn, orderByDirection, totalRecords, searchInput, adminId }
 * @returns {Promise<object>} Course topics list with page details
 */
export async function fetchMicroCourseTopicList(params = {}) {
    try {
        const adminId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildMicroCourseTopicListInput(
            params.pageNo ?? 1,
            params.pageSize ?? 10,
            params.orderByColumn ?? 'UpdatedOn',
            params.orderByDirection ?? 'DESC',
            params.totalRecords ?? 0,
            adminId,
            params.searchInput ?? ''
        );

        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicroCourseTopicList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicroCourseTopicListErrorOutput(response.data, response.status);
        }

        return parseMicroCourseTopicListOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in fetchMicroCourseTopicList:', error);
        return parseMicroCourseTopicListErrorOutput({ message: error.message }, 500);
    }
}

// Alias
export const microCourseTopicList = fetchMicroCourseTopicList;

/**
 * 3.2 Get Checkpoint Quiz Topics & Detail Modal
 * Endpoint: POST /Api/IgnitoMicroCredencialAPI/GetMicroCourseCheckpointQuizTopicDetail
 *
 * @param {number|object} courseIdOrParams - Microcredential course ID
 * @returns {Promise<object>} Topic details with checkpoint status and video IDs
 */
export async function getMicroCourseCheckpointQuizTopicDetail(courseIdOrParams) {
    try {
        const inputDto = buildGetMicroCourseCheckpointQuizTopicDetailInput(courseIdOrParams);
        const response = await apiClient('Api/IgnitoMicroCredencialAPI/GetMicroCourseCheckpointQuizTopicDetail', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicroCourseCheckpointQuizTopicDetailErrorOutput(response.data, response.status);
        }

        return parseGetMicroCourseCheckpointQuizTopicDetailOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicroCourseCheckpointQuizTopicDetail:', error);
        return parseGetMicroCourseCheckpointQuizTopicDetailErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 3.3 View AI Checkpoint Quiz Questions & Explanations
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizData
 *
 * @param {number|object} videoIdOrParams - Microcredit YouTube Data Master ID
 * @returns {Promise<object>} Questions, answer choices, markers, explanations
 */
export async function getMicrocredentialCheckpointQuizData(videoIdOrParams) {
    try {
        const inputDto = buildGetMicrocredentialCheckpointQuizDataInput(videoIdOrParams);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizData', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialCheckpointQuizDataErrorOutput(response.data, response.status);
        }

        return parseGetMicrocredentialCheckpointQuizDataOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicrocredentialCheckpointQuizData:', error);
        return parseGetMicrocredentialCheckpointQuizDataErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 3.4 Delete Checkpoint Quiz by Video Youtube ID
 * Endpoint: POST /Api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByYoutubeDataMasterId
 *
 * @param {number|object} videoIdOrParams - Microcredit YouTube Data Master ID
 * @returns {Promise<object>} Deletion status
 */
export async function deleteMicrocredentialCheckpointQuizByYoutubeDataMasterId(videoIdOrParams) {
    try {
        const inputDto = buildDeleteMicrocredentialCheckpointQuizByYoutubeDataMasterIdInput(videoIdOrParams);
        const response = await apiClient('Api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByYoutubeDataMasterId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDeleteMicrocredentialCheckpointQuizErrorOutput(response.data, response.status);
        }

        return parseDeleteMicrocredentialCheckpointQuizOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in deleteMicrocredentialCheckpointQuizByYoutubeDataMasterId:', error);
        return parseDeleteMicrocredentialCheckpointQuizErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 3.5 Delete All Checkpoint Quizzes by Course ID
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByCourseId
 *
 * @param {number|object} courseIdOrParams - Microcredential Course ID
 * @returns {Promise<object>} Deletion status
 */
export async function deleteMicrocredentialCheckpointQuizByCourseId(courseIdOrParams) {
    try {
        const inputDto = buildDeleteMicrocredentialCheckpointQuizByCourseIdInput(courseIdOrParams);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByCourseId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseDeleteMicrocredentialCheckpointQuizErrorOutput(response.data, response.status);
        }

        return parseDeleteMicrocredentialCheckpointQuizOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in deleteMicrocredentialCheckpointQuizByCourseId:', error);
        return parseDeleteMicrocredentialCheckpointQuizErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 3.6 Fetch Student Downloadable Documents
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialStudentDownloadDocuments
 *
 * @param {number|object} courseIdOrParams - Microcredential Course ID
 * @returns {Promise<object>} Documents list
 */
export async function getMicrocredentialStudentDownloadDocuments(courseIdOrParams) {
    try {
        const courseId = typeof courseIdOrParams === 'object' && courseIdOrParams !== null
            ? (courseIdOrParams.microcredentialCourseId ?? courseIdOrParams.MicrocredentialCourseId ?? 0)
            : courseIdOrParams;

        const inputDto = buildGetMicrocredentialStudentDownloadDocumentsInput(courseId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialStudentDownloadDocuments', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialStudentDownloadDocumentsErrorOutput(response.data, response.status);
        }

        return parseGetMicrocredentialStudentDownloadDocumentsOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicrocredentialStudentDownloadDocuments:', error);
        return parseGetMicrocredentialStudentDownloadDocumentsErrorOutput({ message: error.message }, 500);
    }
}

// =============================================================================
// SECTION 4: ADD CHECKPOINT QUIZ (AddMicrocredentialCheckpointQuiz.js)
// =============================================================================

/**
 * 4.3 Get Video Lectures by Course ID
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialVideoDetailsByCourseId
 *
 * @param {number|object} courseIdOrParams - Microcredential Course ID
 * @returns {Promise<object>} Video lectures list
 */
export async function getMicrocredentialVideoDetailsByCourseId(courseIdOrParams) {
    try {
        const inputDto = buildGetMicrocredentialVideoDetailsByCourseIdInput(courseIdOrParams);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialVideoDetailsByCourseId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialVideoDetailsByCourseIdErrorOutput(response.data, response.status);
        }

        return parseGetMicrocredentialVideoDetailsByCourseIdOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicrocredentialVideoDetailsByCourseId:', error);
        return parseGetMicrocredentialVideoDetailsByCourseIdErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 4.4 Generate AI Microcredential Checkpoint Quiz
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GenerateMicrocredentialCheckpointQuiz
 *
 * @param {number|object} videoIdOrParams - Video YouTube Data Master ID or parameter object
 * @param {number} [adminId] - Admin ID (optional, dynamically resolved)
 * @returns {Promise<object>} AI Generation status & message
 */
export async function generateMicrocredentialCheckpointQuiz(videoIdOrParams, adminId) {
    try {
        const params = typeof videoIdOrParams === 'object' && videoIdOrParams !== null
            ? videoIdOrParams
            : { microcreditYoutubeDataMasterId: videoIdOrParams, adminId };

        const resolvedId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildGenerateMicrocredentialCheckpointQuizInput({ ...params, adminId: resolvedId });

        const response = await apiClient('api/IgnitoMicroCredencialAPI/GenerateMicrocredentialCheckpointQuiz', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGenerateMicrocredentialCheckpointQuizErrorOutput(response.data, response.status);
        }

        return parseGenerateMicrocredentialCheckpointQuizOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in generateMicrocredentialCheckpointQuiz:', error);
        return parseGenerateMicrocredentialCheckpointQuizErrorOutput({ message: error.message }, 500);
    }
}

// =============================================================================
// SECTION 5: CHECKPOINT QUIZ REPORT (MicrocredentialCheckpointQuizReport.js)
// =============================================================================

/**
 * 5.1 Fetch Student Checkpoint Quiz Report Table
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizReport
 *
 * @param {object} [params={}] - { pageNo, pageSize, orderByColumn, orderByDirection, searchInput, adminId }
 * @returns {Promise<object>} Student checkpoint quiz scores and accuracy table
 */
export async function getMicrocredentialCheckpointQuizReport(params = {}) {
    try {
        const adminId = resolveAdminId(params.adminId ?? params.AdminId);
        const inputDto = buildGetMicrocredentialCheckpointQuizReportInput({ ...params, adminId });

        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizReport', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialCheckpointQuizReportErrorOutput(response.data, response.status);
        }

        return parseGetMicrocredentialCheckpointQuizReportOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicrocredentialCheckpointQuizReport:', error);
        return parseGetMicrocredentialCheckpointQuizReportErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 5.2 Fetch Detailed Student Quiz Responses & Summary
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetStudentMicrocredentialQuizResponse
 *
 * @param {number|object} studentIdOrParams - Student ID or options object
 * @param {number} [microcredentialCourseId] - Course ID
 * @param {number} [videoId] - Video YouTube Data Master ID
 * @returns {Promise<object>} Quiz summary stats and question-by-question student responses
 */
export async function getStudentMicrocredentialQuizResponse(studentIdOrParams, microcredentialCourseId, videoId) {
    try {
        const inputDto = buildGetStudentMicrocredentialQuizResponseInput(studentIdOrParams, microcredentialCourseId, videoId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetStudentMicrocredentialQuizResponse', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetStudentMicrocredentialQuizResponseErrorOutput(response.data, response.status);
        }

        return parseGetStudentMicrocredentialQuizResponseOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getStudentMicrocredentialQuizResponse:', error);
        return parseGetStudentMicrocredentialQuizResponseErrorOutput({ message: error.message }, 500);
    }
}

// =============================================================================
// RE-EXPORTS FOR DTO BUILDERS & PARSERS
// =============================================================================
export * from '../dto/input/adminQuizInputs';
export * from '../dto/output/adminQuizOutputs';

// Default export object aggregating all methods
const AdminQuizPageService = {
    getLoggedInAdminId,
    // Section 1
    fetchPaginatedMicrocredentialQuizList,
    mainDegreeQuizList,
    toggleQuizActiveInactiveStatus,
    activeInactiveDegreeQuiz,
    deleteQuizByQuizId,
    deleteDegreeQuizByQuizId,
    // Section 2
    getEducationType,
    getStreamsDropdown,
    getStreamData,
    getProgrammesByStream,
    getStreamByProgramme,
    getMicrocredentialCoursesByStream,
    getMicrocredentialCourse,
    getMicrocredentialModuleByCourseId,
    saveDegreeQuizMaster,
    degreeQuizMasterAddUpdate,
    getDegreeQuizDetailsByQuizId,
    finalizeDegreeQuiz,
    finalizeDegreeQuizAddUpdate,
    getDegreeQuizQuestionsList,
    degreeQuizQuestionsList,
    toggleDegreeQuizQuestionStatus,
    activeInactiveDegreeQuizQuestions,
    deleteDegreeQuizQuestion,
    deleteDegreeQuizQuestions,
    saveDegreeQuizQuestionMaster,
    degreeQuizQuestionMasterAddUpdate,
    getDegreeStudentsForSpecialQuizAccess,
    getMicrocredentialQuizCategoryList,
    getDegreeQuizPreviewByQuizId,
    getDegreeQuizPerviewGetByQuizId,
    getDegreeQuizPerviewByQuizId,
    checkPublicIpAddress,
    // Section 3
    fetchMicroCourseTopicList,
    microCourseTopicList,
    getMicroCourseCheckpointQuizTopicDetail,
    getMicrocredentialCheckpointQuizData,
    deleteMicrocredentialCheckpointQuizByYoutubeDataMasterId,
    deleteMicrocredentialCheckpointQuizByCourseId,
    getMicrocredentialStudentDownloadDocuments,
    // Section 4
    getMicrocredentialVideoDetailsByCourseId,
    generateMicrocredentialCheckpointQuiz,
    // Section 5
    getMicrocredentialCheckpointQuizReport,
    getStudentMicrocredentialQuizResponse,
    fetchMicrocredentialQuizStudentResultList,
    getMicrocredentialQuizStudentAttemptList,
    getStudentMicrocredentialQuizResultGetByQuizId,
    getStudentMicrocredentialQuizResultByAttempt
};

export { getMicrocredentialModuleByCourseId };
export * from './microcredentialQuizResultService';

export default AdminQuizPageService;

