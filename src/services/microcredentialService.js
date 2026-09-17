import { apiClient } from './apiClient';
import { buildMicrocredentialCourseBindDataListInput } from '../dto/input/microcredentialCourseBindDataListInput';
import { parseMicrocredentialCourseBindDataListOutput, parseMicrocredentialCourseBindDataListErrorOutput } from '../dto/output/microcredentialCourseBindDataListOutput';
import { buildGetMicroCourseTopicDetailInput } from '../dto/input/getMicroCourseTopicDetailInput';
import { parseGetMicroCourseTopicDetailOutput, parseGetMicroCourseTopicDetailErrorOutput } from '../dto/output/getMicroCourseTopicDetailOutput';
import { buildMicroCredencialWatchvideoAddUpdateInput } from '../dto/input/microCredencialWatchvideoAddUpdateInput';
import { parseMicroCredencialWatchvideoAddUpdateOutput, parseMicroCredencialWatchvideoAddUpdateErrorOutput } from '../dto/output/microCredencialWatchvideoAddUpdateOutput';
import { buildGetMicrocredentialCourseDetailInput } from '../dto/input/getMicrocredentialCourseDetailInput';
import { parseGetMicrocredentialCourseDetailOutput, parseGetMicrocredentialCourseDetailErrorOutput } from '../dto/output/getMicrocredentialCourseDetailOutput';
import { buildGetStudentReviewByMicroCorseIdInput } from '../dto/input/getStudentReviewByMicroCorseIdInput';
import { parseGetStudentReviewByMicroCorseIdOutput, parseGetStudentReviewByMicroCorseIdErrorOutput } from '../dto/output/getStudentReviewByMicroCorseIdOutput';
import { buildGetReviewByMicroCourseIdInput } from '../dto/input/getReviewByMicroCourseIdInput';
import { parseGetReviewByMicroCourseIdOutput, parseGetReviewByMicroCourseIdErrorOutput } from '../dto/output/getReviewByMicroCourseIdOutput';
import { buildIgnitoMicroStudentReviewInsertInput } from '../dto/input/ignitoMicroStudentReviewInsertInput';
import { parseIgnitoMicroStudentReviewInsertOutput, parseIgnitoMicroStudentReviewInsertErrorOutput } from '../dto/output/ignitoMicroStudentReviewInsertOutput';
import { buildMicrocredentialStudentReviewLikeInsertInput } from '../dto/input/microcredentialStudentReviewLikeInsertInput';
import { parseMicrocredentialStudentReviewLikeInsertOutput, parseMicrocredentialStudentReviewLikeInsertErrorOutput } from '../dto/output/microcredentialStudentReviewLikeInsertOutput';
import { buildGetStudentEnrolledMicrocredentialCourseInput } from '../dto/input/getStudentEnrolledMicrocredentialCourseInput';
import { parseGetStudentEnrolledMicrocredentialCourseOutput, parseGetStudentEnrolledMicrocredentialCourseErrorOutput } from '../dto/output/getStudentEnrolledMicrocredentialCourseOutput';

// To get list of Microcredential Courses
export async function getMicrocredentialCourseBindDataList(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'UpdatedOn',
    orderByDirection = 'DESC',
    totalRecords = 0,
    searchInput = "",
    streamId = 0,
    isAllSelect = false,
    selectedLevelIds = '',
    microcredentialCourseId = 0 
) {
    
    try {
        const inputDto = buildMicrocredentialCourseBindDataListInput(
            pageNo,
            pageSize,
            orderByColumn,
            orderByDirection,
            totalRecords,
            searchInput,
            streamId,
            isAllSelect,
            selectedLevelIds,
            microcredentialCourseId 
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialCourseBindDataList', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialCourseBindDataListErrorOutput(response.data, response.status);
        }
        const outputDto = parseMicrocredentialCourseBindDataListOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error fetching microcredential course list:', error);
        return parseMicrocredentialCourseBindDataListErrorOutput({ message: error.message }, 500);
    }
}

/*
 Fetches course video topics, video metadata/duration, topic PDFs, and 
 downloadable documents when the page loads.
*/

export async function getMicroCourseTopicDetail(
    microcredentialCourseId,
    studentId,
    encryptedMicrocredentialCourseId = ''
) {
    
    try {
        const inputDto = buildGetMicroCourseTopicDetailInput(
            microcredentialCourseId,
            studentId,
            encryptedMicrocredentialCourseId
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetMicroCourseTopicDetail', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseGetMicroCourseTopicDetailErrorOutput(response.data, response.status);
        }
        const outputDto = parseGetMicroCourseTopicDetailOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error fetching microcredential course list:', error);
        return parseGetMicroCourseTopicDetailErrorOutput({ message: error.message }, 500);
    }
}

/*
 Periodically (every 2 minutes) or on page unload (beforeunload), updates 
  watched seconds and overall completion percentage.
 */

export async function microCredencialWatchvideoAddUpdate(
    studentId = 0,
    microcredentialCourseId = 0,
    overallPercentage = 0,
    studentwatchvideodetails = []
) {
    try {
        const inputDto = buildMicroCredencialWatchvideoAddUpdateInput(
            studentId,
            microcredentialCourseId,
            overallPercentage,
            studentwatchvideodetails
        );
        const response = await apiClient('api/MicroCredencialStudentWatchVideoAPI/MicroCredencialWatchvideoAddUpdate', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseMicroCredencialWatchvideoAddUpdateErrorOutput(response.data, response.status);
        }
        const outputDto = parseMicroCredencialWatchvideoAddUpdateOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error updating microcredential watch video:', error);
        return parseMicroCredencialWatchvideoAddUpdateErrorOutput({ message: error.message }, 500);
    }
}

/*
 Fetches microcredential course detail by course ID.
 API: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCourseDetail
*/
export async function getMicrocredentialCourseDetail(microcredentialCourseId) {
    try {
        const inputDto = buildGetMicrocredentialCourseDetailInput(microcredentialCourseId);
        const endpoint = `api/IgnitoMicroCredencialAPI/GetMicrocredentialCourseDetail?MicrocredentialCourseId=${encodeURIComponent(microcredentialCourseId)}`;
        const response = await apiClient(endpoint, {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseGetMicrocredentialCourseDetailErrorOutput(response.data, response.status);
        }
        const outputDto = parseGetMicrocredentialCourseDetailOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error fetching microcredential course detail:', error);
        return parseGetMicrocredentialCourseDetailErrorOutput({ message: error.message }, 500);
    }
}

/*
 Fetches student review details by student ID and microcredential course ID.
 API: POST /api/IgnitoMicroCredencialAPI/GetStudentReviewByMicroCorseId
*/
export async function getStudentReviewByMicroCorseId(studentId = 0, microcredentialCourseId = 0) {
    try {
        const inputDto = buildGetStudentReviewByMicroCorseIdInput(studentId, microcredentialCourseId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetStudentReviewByMicroCorseId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseGetStudentReviewByMicroCorseIdErrorOutput(response.data, response.status);
        }
        const outputDto = parseGetStudentReviewByMicroCorseIdOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error fetching student review by micro course id:', error);
        return parseGetStudentReviewByMicroCorseIdErrorOutput({ message: error.message }, 500);
    }
}

/*
 Fetches list of reviews for a microcredential course by course ID and student ID.
 API: POST /api/IgnitoMicroCredencialAPI/GetReviewByMicroCourseId
*/
export async function getReviewByMicroCourseId(microcredentialCourseId = 0, studentId = 0) {
    try {
        const inputDto = buildGetReviewByMicroCourseIdInput(microcredentialCourseId, studentId);
        const response = await apiClient('api/IgnitoMicroCredencialAPI/GetReviewByMicroCourseId', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseGetReviewByMicroCourseIdErrorOutput(response.data, response.status);
        }
        const outputDto = parseGetReviewByMicroCourseIdOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error fetching review by micro course id:', error);
        return parseGetReviewByMicroCourseIdErrorOutput({ message: error.message }, 500);
    }
}

/*
 Inserts a student review for a microcredential course.
 API: POST /api/IgnitoMicroCredencialAPI/IgnitoMicroStudentReviewInsert
*/
export async function ignitoMicroStudentReviewInsert(
    studentId = 0,
    microcredentialCourseId = 0,
    reviewInStar = 0,
    reviewDescription = ''
) {
    try {
        const inputDto = buildIgnitoMicroStudentReviewInsertInput(
            studentId,
            microcredentialCourseId,
            reviewInStar,
            reviewDescription
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/IgnitoMicroStudentReviewInsert', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseIgnitoMicroStudentReviewInsertErrorOutput(response.data, response.status);
        }
        const outputDto = parseIgnitoMicroStudentReviewInsertOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error inserting student review:', error);
        return parseIgnitoMicroStudentReviewInsertErrorOutput({ message: error.message }, 500);
    }
}

/*
 Likes or un-likes a student review for a microcredential course.
 API: POST /api/IgnitoMicroCredencialAPI/MicrocredentialStudentReviewLikeInsert
*/
export async function microcredentialStudentReviewLikeInsert(
    microcredentialReviewId = 0,
    studentId = 0,
    microcredentialCourseId = 0
) {
    try {
        const inputDto = buildMicrocredentialStudentReviewLikeInsertInput(
            microcredentialReviewId,
            studentId,
            microcredentialCourseId
        );
        const response = await apiClient('api/IgnitoMicroCredencialAPI/MicrocredentialStudentReviewLikeInsert', {
            method: 'POST',
            headers: inputDto.headers,
            body: inputDto.body
        });
        if (!response.ok && response.status !== 200) {
            return parseMicrocredentialStudentReviewLikeInsertErrorOutput(response.data, response.status);
        }
        const outputDto = parseMicrocredentialStudentReviewLikeInsertOutput(response.data, response.status);
        return outputDto;
    } catch (error) {
        console.error('Error liking student review:', error);
        return parseMicrocredentialStudentReviewLikeInsertErrorOutput({ message: error.message }, 500);
    }
}

/*
 Fetch Student Enrolled Microcredential Courses for Profile Page.
 API: POST /api/StudentMyProfileAPI/GetStudentEnrolledMicrocredentialCourse
*/
export async function getStudentEnrolledMicrocredentialCourse(
    studentId = 3,
    enrolledMode = 1
) {
    try {
        const inputDto = buildGetStudentEnrolledMicrocredentialCourseInput(
            studentId,
            enrolledMode
        );
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
        console.error('Error fetching student enrolled microcredential courses:', error);
        return parseGetStudentEnrolledMicrocredentialCourseErrorOutput({ message: error.message }, 500);
    }
}
// Export Google Calendar Event services
export {
  createGoogleCalendarEvent,
  getGoogleCalendarEventList,
} from './microcredentialGoogleCalendarService';


