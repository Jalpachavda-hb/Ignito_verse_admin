/**
 * PROFILE SERVICE
 * Service functions connecting Student Profile UI with backend .NET Web API endpoints.
 */

import { apiClient } from './apiClient';
import { buildGetStudentEnrolledMicrocredentialCourseInput } from '../dto/input/getStudentEnrolledMicrocredentialCourseInput';
import { parseGetStudentEnrolledMicrocredentialCourseOutput, parseGetStudentEnrolledMicrocredentialCourseErrorOutput } from '../dto/output/getStudentEnrolledMicrocredentialCourseOutput';
import { buildStudentMicrocredentialsQuizAttemptListInput } from '../dto/input/studentMicrocredentialsQuizAttemptListInput';
import { parseStudentMicrocredentialsQuizAttemptListOutput, parseStudentMicrocredentialsQuizAttemptListErrorOutput } from '../dto/output/studentMicrocredentialsQuizAttemptListOutput';
import { buildGetStudentMicrocredentialQuizResultGetByQuizIdInput } from '../dto/input/getStudentMicrocredentialQuizResultGetByQuizIdInput';
import { parseGetStudentMicrocredentialQuizResultGetByQuizIdOutput, parseGetStudentMicrocredentialQuizResultGetByQuizIdErrorOutput } from '../dto/output/getStudentMicrocredentialQuizResultGetByQuizIdOutput';

/**
 * Fetches enrolled microcredential courses for a student.
 * API: POST /api/StudentMyProfileAPI/GetStudentEnrolledMicrocredentialCourse
 * 
 * @param {number} [studentId=0] - Student ID (0 uses session studentId on backend)
 * @param {number} [enrolledMode=1] - Enrolled Mode (default 1)
 * @returns {Promise<object>} Parsed output containing `{ success, getStudentEnrolledMicrocredentialCourseList, status, message, rawData }`
 */
export async function getStudentEnrolledMicrocredentialCourse(studentId = 0, enrolledMode = 1) {
    try {
        const inputDto = buildGetStudentEnrolledMicrocredentialCourseInput(studentId, enrolledMode);
        const response = await apiClient('api/StudentMyProfileAPI/GetStudentEnrolledMicrocredentialCourse', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetStudentEnrolledMicrocredentialCourseErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetStudentEnrolledMicrocredentialCourseOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getStudentEnrolledMicrocredentialCourse:', error);
        return parseGetStudentEnrolledMicrocredentialCourseErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches list of microcredentials student quiz attempts.
 * API: POST /api/StudentMyProfileAPI/StudentMicrocredentialsQuizAttemptList
 * 
 * @param {number} [pageNo=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [orderByColumn='QuizId'] - Column to order by
 * @param {string} [orderByDirection='DESC'] - Order direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @param {string} [searchInput=''] - Search input text
 * @param {number} [studentId=0] - Student ID (0 defaults to session StudentId on backend)
 * @returns {Promise<object>} Parsed output containing `{ success, microStudentQuizAttemptList, pageDetail, status, message, rawData }`
 */
export async function studentMicrocredentialsQuizAttemptList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'QuizId',
    orderByDirection = 'DESC',
    totalRecords = 0,
    searchInput = '',
    studentId = 0
) {
    try {
        const inputDto = buildStudentMicrocredentialsQuizAttemptListInput(
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            totalRecords,
            searchInput,
            studentId
        );
        const response = await apiClient('api/StudentMyProfileAPI/StudentMicrocredentialsQuizAttemptList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseStudentMicrocredentialsQuizAttemptListErrorOutput(response.data, response.status);
        }

        const outputDto = parseStudentMicrocredentialsQuizAttemptListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in studentMicrocredentialsQuizAttemptList:', error);
        return parseStudentMicrocredentialsQuizAttemptListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * Fetches student microcredential quiz result by Quiz ID.
 * API: POST /api/StudentMyProfileAPI/GetStudentMicrocredentialQuizResultGetByQuizId
 * 
 * @param {number} [quizId=0] - Quiz ID
 * @param {number} [studentId=0] - Student ID (0 uses session studentId on backend)
 * @param {number} [attemptId=0] - Attempt ID
 * @returns {Promise<object>} Parsed output containing quiz result details and question collections
 */
export async function getStudentMicrocredentialQuizResultGetByQuizId(
    quizId = 0,
    studentId = 0,
    attemptId = 0
) {
    try {
        const inputDto = buildGetStudentMicrocredentialQuizResultGetByQuizIdInput(quizId, studentId, attemptId);
        const response = await apiClient('api/StudentMyProfileAPI/GetStudentMicrocredentialQuizResultGetByQuizId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetStudentMicrocredentialQuizResultGetByQuizIdErrorOutput(response.data, response.status);
        }

        const outputDto = parseGetStudentMicrocredentialQuizResultGetByQuizIdOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error in getStudentMicrocredentialQuizResultGetByQuizId:', error);
        return parseGetStudentMicrocredentialQuizResultGetByQuizIdErrorOutput({ message: error.message }, 500);
    }
}


