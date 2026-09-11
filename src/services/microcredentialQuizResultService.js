/**
 * MICROCREDENTIAL QUIZ RESULT SERVICE
 * Endpoints for Admin Microcredential Quiz Result & Student Attempts Audit.
 */

import { apiClient } from './apiClient';
import { buildMicrocredentialQuizStudentResultListInput } from '../dto/input/microcredentialQuizStudentResultListInput';
import {
    parseMicrocredentialQuizStudentResultListOutput,
    parseMicrocredentialQuizStudentResultListErrorOutput
} from '../dto/output/microcredentialQuizStudentResultListOutput';

import { buildGetMicrocredentialQuizStudentAttemptListInput } from '../dto/input/getMicrocredentialQuizStudentAttemptListInput';
import {
    parseGetMicrocredentialQuizStudentAttemptListOutput,
    parseGetMicrocredentialQuizStudentAttemptListErrorOutput
} from '../dto/output/getMicrocredentialQuizStudentAttemptListOutput';

import { buildGetStudentMicrocredentialQuizResultGetByQuizIdInput } from '../dto/input/getStudentMicrocredentialQuizResultGetByQuizIdInput';
import {
    parseGetStudentMicrocredentialQuizResultGetByQuizIdOutput,
    parseGetStudentMicrocredentialQuizResultGetByQuizIdErrorOutput
} from '../dto/output/getStudentMicrocredentialQuizResultGetByQuizIdOutput';


/**
 * 1. Fetch Microcredential Quiz Student Result List (Admin Table)
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicrocredentialQuizStudentResultList
 */
export async function fetchMicrocredentialQuizStudentResultList(params = {}) {
    try {
        const inputDto = buildMicrocredentialQuizStudentResultListInput(params);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialQuizStudentResultList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialQuizStudentResultListErrorOutput(response.data, response.status);
        }

        return parseMicrocredentialQuizStudentResultListOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in fetchMicrocredentialQuizStudentResultList:', error);
        return parseMicrocredentialQuizStudentResultListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 2. Get Student Quiz Attempt List for a Quiz
 * Endpoint: POST /api/StudentMicrocredentialQuizAPI/GetMicrocredentialQuizStudentAttemptList
 */
export async function getMicrocredentialQuizStudentAttemptList(studentId = 0, quizId = 0) {
    try {
        const inputDto = buildGetMicrocredentialQuizStudentAttemptListInput(studentId, quizId);
        const response = await apiClient('api/StudentMicrocredentialQuizAPI/GetMicrocredentialQuizStudentAttemptList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialQuizStudentAttemptListErrorOutput(response.data, response.status);
        }

        return parseGetMicrocredentialQuizStudentAttemptListOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getMicrocredentialQuizStudentAttemptList:', error);
        return parseGetMicrocredentialQuizStudentAttemptListErrorOutput({ message: error.message }, 500);
    }
}

/**
 * 3. Get Detailed Quiz Questions and Responses for a Specific Attempt
 * Endpoint: POST /api/StudentMicrocredentialQuizAPI/GetStudentMicrocredentialQuizResultGetByQuizId
 */
export async function getStudentMicrocredentialQuizResultGetByQuizId(arg1 = 0, arg2 = 0, arg3 = 0) {
    try {
        const inputDto = buildGetStudentMicrocredentialQuizResultGetByQuizIdInput(arg1, arg2, arg3);
        const response = await apiClient('api/StudentMicrocredentialQuizAPI/GetStudentMicrocredentialQuizResultGetByQuizId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });

        if (!response.ok && response.status !== 200) {
            return parseGetStudentMicrocredentialQuizResultGetByQuizIdErrorOutput(response.data, response.status);
        }

        return parseGetStudentMicrocredentialQuizResultGetByQuizIdOutput(response.data, response.status);
    } catch (error) {
        console.error('Error in getStudentMicrocredentialQuizResultGetByQuizId:', error);
        return parseGetStudentMicrocredentialQuizResultGetByQuizIdErrorOutput({ message: error.message }, 500);
    }
}

// Alias for backwards compatibility
export const getStudentMicrocredentialQuizResultByAttempt = getStudentMicrocredentialQuizResultGetByQuizId;

