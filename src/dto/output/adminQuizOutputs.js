/**
 * OUTPUT DTO PARSERS: Admin Quiz & Checkpoint Quiz Module
 * Robustly parses and formats .NET Web API JSON responses into standardized DTO objects.
 */

/**
 * Safely parses raw input if it's a JSON string.
 */
function safeParseJson(raw) {
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }
    return raw || {};
}

/**
 * Resolves success flag from common .NET backend conventions.
 */
function resolveSuccess(rawJson, status) {
    const isHttpOk = status >= 200 && status < 300;
    const explicitSuccess = rawJson?.isSuccess ?? rawJson?.IsSuccess ?? rawJson?.success ?? rawJson?.Success;
    if (explicitSuccess !== undefined && explicitSuccess !== null) {
        return Boolean(explicitSuccess) && isHttpOk;
    }
    return isHttpOk;
}

/**
 * Resolves message text from response.
 */
function resolveMessage(rawJson, defaultMsg = '') {
    return rawJson?.message || rawJson?.Message || rawJson?.title || defaultMsg;
}

/**
 * Resolves error description from response.
 */
function resolveErrorDescription(rawJson, defaultError = '') {
    return rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || rawJson?.message || rawJson?.Message || defaultError;
}

// =============================================================================
// SECTION 1: MICROCREDENTIAL QUIZ LIST
// =============================================================================

/**
 * 1.1 Parse Paginated Microcredential Quiz List Output
 * Endpoint: POST /api/DegreeQuizAPI/MainDegreeQuizList
 */
export function parseMainDegreeQuizListOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.quizDegreeList || data?.QuizDegreeList || data?.degreeQuizList || data?.DegreeQuizList || data?.quizList || data?.QuizList || (Array.isArray(data) ? data : []);
    const quizDegreeList = Array.isArray(rawList)
        ? rawList.map(item => ({
            ...item,
            quizId: item?.quizId ?? item?.QuizId ?? item?.id ?? 0,
            quizTitle: item?.quizTitle || item?.QuizTitle || item?.title || '',
            quizDescription: item?.quizDescription || item?.QuizDescription || item?.description || item?.Description || '',
            educationTypeId: item?.educationTypeId ?? item?.EducationTypeId ?? 2,
            educationTypeName: item?.educationTypeName || item?.EducationTypeName || '',
            streamId: item?.streamId ?? item?.StreamId ?? 0,
            streamName: item?.streamName || item?.StreamName || item?.stream || '',
            microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
            microcredentialCourseName: item?.microcredentialCourseName || item?.MicrocredentialCourseName || item?.microcredentialName || item?.MicrocredentialName || '',
            microcredentialName: item?.microcredentialName || item?.MicrocredentialName || item?.microcredentialCourseName || item?.MicrocredentialCourseName || '',
            microcredentialModuleMasterId: item?.microcredentialModuleMasterId ?? item?.MicrocredentialModuleMasterId ?? 0,
            moduleName: item?.moduleName || item?.ModuleName || '',
            degreeProgramName: item?.degreeProgramName || item?.DegreeProgramName || '',
            degreeCourseName: item?.degreeCourseName || item?.DegreeCourseName || '',
            semesterId: item?.semesterId ?? item?.SemesterId ?? 0,
            unitName: item?.unitName || item?.UnitName || '',
            quizCreatedName: item?.quizCreatedName || item?.QuizCreatedName || item?.quizCreaterName || item?.QuizCreaterName || item?.creatorName || '',
            quizCreaterName: item?.quizCreaterName || item?.QuizCreaterName || item?.quizCreatedName || item?.QuizCreatedName || item?.creatorName || '',
            dueDate: item?.dueDate || item?.DueDate || '',
            gradeOutOf: item?.gradeOutOf ?? item?.GradeOutOf ?? 100,
            isActive: Boolean(item?.isActive ?? item?.IsActive ?? item?.issubmit ?? item?.isSubmit ?? item?.IsSubmit ?? false),
            issubmit: Boolean(item?.issubmit ?? item?.isSubmit ?? item?.IsSubmit ?? false),
            createdOn: item?.createdOn || item?.CreatedOn || '',
            updatedOn: item?.updatedOn || item?.UpdatedOn || ''
        }))
        : [];

    const rawPageDetail = data?.pageDetail || data?.PageDetail || {};
    const pageDetail = {
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10,
        orderByColumn: rawPageDetail?.orderByColumn || rawPageDetail?.OrderByColumn || 'UpdatedOn',
        orderByDirection: rawPageDetail?.orderByDirection || rawPageDetail?.OrderByDirection || 'DESC',
        totalRecords: rawPageDetail?.totalRecords ?? rawPageDetail?.TotalRecords ?? quizDegreeList.length
    };

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Quiz list fetched successfully' : 'Failed to fetch quiz list'),
        errorDescription: !isSuccess ? resolveErrorDescription(data, 'Failed to fetch quiz list') : '',
        quizDegreeList,
        degreeQuizList: quizDegreeList,
        pageDetail,
        totalRecords: pageDetail.totalRecords,
        rawData: data
    };
}

export function parseMainDegreeQuizListErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch microcredential quiz list'),
        errorDescription: resolveErrorDescription(data, 'Network or server error occurred'),
        quizDegreeList: [],
        pageDetail: { pageNo: 1, pageSize: 10, orderByColumn: 'UpdatedOn', orderByDirection: 'DESC', totalRecords: 0 },
        totalRecords: 0,
        rawData: data
    };
}

/**
 * 1.2 Parse Toggle Quiz Active / Inactive Status Output
 * Endpoint: POST /api/DegreeQuizAPI/ActiveInactiveDegreeQuiz
 */
export function parseActiveInactiveDegreeQuizOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Quiz status updated successfully' : 'Failed to update quiz status'),
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseActiveInactiveDegreeQuizErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to update quiz status'),
        errorDescription: resolveErrorDescription(data, 'Server error'),
        rawData: data
    };
}

/**
 * 1.3 Parse Delete Quiz by Quiz ID Output
 * Endpoint: POST /api/DegreeQuizAPI/DeleteDegreeQuizByQuizId
 */
export function parseDeleteDegreeQuizByQuizIdOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Quiz deleted successfully.' : 'Failed to delete quiz.'),
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseDeleteDegreeQuizByQuizIdErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to delete quiz'),
        errorDescription: resolveErrorDescription(data, 'Server error'),
        rawData: data
    };
}

// =============================================================================
// SECTION 2: ADD / EDIT MICROCREDENTIAL QUIZ
// =============================================================================

/**
 * 2.1 Parse Get Education Type List Output
 * Endpoint: POST /api/AdminCommonAPI/GetEducationType
 */
export function parseGetEducationTypeOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);
    const rawList = data?.educationList || data?.EducationList || (Array.isArray(data) ? data : []);

    const educationList = Array.isArray(rawList)
        ? rawList.map(item => ({
            educationTypeId: item?.educationTypeId ?? item?.EducationTypeId ?? item?.id ?? 0,
            educationTypeName: item?.educationTypeName || item?.EducationTypeName || item?.name || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Education types fetched'),
        educationList,
        rawData: data
    };
}

export function parseGetEducationTypeErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch education types'),
        educationList: [],
        rawData: data
    };
}

/**
 * 2.3 Parse Get Programmes by Stream Output
 * Endpoint: POST /api/ProgramAPI/GetStreamByProgramme
 */
export function parseGetStreamByProgrammeOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);
    const rawList = data?.streamByProgrammeList || data?.StreamByProgrammeList || (Array.isArray(data) ? data : []);

    const streamByProgrammeList = Array.isArray(rawList)
        ? rawList.map(item => ({
            programId: item?.programId ?? item?.ProgramId ?? item?.id ?? 0,
            programName: item?.programName || item?.ProgramName || item?.name || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Programmes fetched'),
        streamByProgrammeList,
        rawData: data
    };
}

export function parseGetStreamByProgrammeErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch programmes'),
        streamByProgrammeList: [],
        rawData: data
    };
}

/**
 * 2.5 Parse Add / Update Quiz Master (Step 1) Output
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizMasterAddUpdate
 */
export function parseDegreeQuizMasterAddUpdateOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);
    const quizId = data?.quizId ?? data?.QuizId ?? data?.id ?? 0;

    return {
        success: isSuccess,
        status,
        quizId: Number(quizId) || 0,
        message: resolveMessage(data, isSuccess ? 'Quiz master saved successfully.' : 'Failed to save quiz master.'),
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseDegreeQuizMasterAddUpdateErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        quizId: 0,
        message: resolveMessage(data, 'Failed to save quiz master'),
        errorDescription: resolveErrorDescription(data, 'Server error'),
        rawData: data
    };
}

/**
 * 2.5B Parse Get Degree Quiz Details By Quiz ID Output
 * Endpoint: POST /api/DegreeQuizAPI/GetDegreeQuizDetailsByQuizId
 */
export function parseGetDegreeQuizDetailsByQuizIdOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);
    const details = data?.degreeQuizDetails || data?.DegreeQuizDetails || data?.quizDetails || data?.QuizDetails || data;

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Quiz details fetched successfully.' : 'Failed to fetch quiz details.'),
        quizDetails: details ? {
            quizId: details?.quizId ?? details?.QuizId ?? 0,
            quizTitle: details?.quizTitle || details?.QuizTitle || '',
            quizDescription: details?.quizDescription || details?.QuizDescription || '',
            educationTypeId: details?.educationTypeId ?? details?.EducationTypeId ?? 2,
            streamId: details?.streamId ?? details?.StreamId ?? 0,
            streamName: details?.streamName || details?.StreamName || details?.stream || '',
            microcredentialCourseId: details?.microcredentialCourseId ?? details?.MicrocredentialCourseId ?? 0,
            microcredentialCourseName: details?.microcredentialCourseName || details?.MicrocredentialCourseName || '',
            microcredentialModuleMasterId: details?.microcredentialModuleMasterId ?? details?.MicrocredentialModuleMasterId ?? 0,
            moduleName: details?.moduleName || details?.ModuleName || '',
            gradeOutOf: details?.gradeOutOf ?? details?.GradeOutOf ?? 100,
            dueDate: details?.dueDate || details?.DueDate || '',
            gradeBook: details?.gradeBook || details?.GradeBook || 'In Grade Book',
            yearRange: details?.yearRange || details?.YearRange || '',
            isActive: Boolean(details?.isActive ?? details?.IsActive ?? true),
            rawDetails: details
        } : null,
        rawData: data
    };
}

export function parseGetDegreeQuizDetailsByQuizIdErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch quiz details'),
        quizDetails: null,
        rawData: data
    };
}

/**
 * 2.6 Parse Finalize Quiz & Save Settings Output
 * Endpoint: POST /api/DegreeQuizAPI/FinalizeDegreeQuizAddUpdate
 */
export function parseFinalizeDegreeQuizAddUpdateOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);
    const studentFcmTokens = data?.studentFcmTokens || data?.StudentFcmTokens || [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Quiz finalized successfully.' : 'Failed to finalize quiz.'),
        studentFcmTokens: Array.isArray(studentFcmTokens) ? studentFcmTokens : [],
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseFinalizeDegreeQuizAddUpdateErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to finalize quiz'),
        studentFcmTokens: [],
        errorDescription: resolveErrorDescription(data, 'Server error'),
        rawData: data
    };
}

/**
 * 2.7 Parse Get Questions List for Quiz Output
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizQuestionsList
 */
export function parseDegreeQuizQuestionsListOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.questionsList || data?.QuestionsList || data?.questionList || data?.QuestionList || [];
    const questionsList = Array.isArray(rawList)
        ? rawList.map(item => ({
            ...item,
            questionsId: item?.questionsId ?? item?.QuestionsId ?? item?.id ?? 0,
            questionId: item?.questionId ?? item?.QuestionId ?? item?.questionsId ?? item?.QuestionsId ?? 0,
            question: item?.question || item?.Question || item?.questionText || item?.QuestionText || '',
            questionText: item?.questionText || item?.QuestionText || item?.question || item?.Question || '',
            questionType: item?.questionType || item?.QuestionType || '',
            degreeQuestionType: Number(item?.degreeQuestionType ?? item?.DegreeQuestionType ?? item?.questionTypeId ?? item?.QuestionTypeId ?? 1),
            points: Number(item?.points ?? item?.Points ?? 0),
            isActive: Boolean(item?.isActive ?? item?.IsActive ?? true),
            createdOn: item?.createdOn || item?.CreatedOn || '',
            options: item?.degreeAnswersOptions || item?.DegreeAnswersOptions || item?.options || item?.degreeAnswerOptionList || item?.DegreeAnswerOptionList || [],
            degreeAnswersOptions: item?.degreeAnswersOptions || item?.DegreeAnswersOptions || item?.options || item?.degreeAnswerOptionList || item?.DegreeAnswerOptionList || [],
            rawItem: item
        }))
        : [];

    const rawPageDetail = data?.pageDetail || data?.PageDetail || {};
    const pageDetail = {
        totalRecords: rawPageDetail?.totalRecords ?? rawPageDetail?.TotalRecords ?? questionsList.length,
        totalPoints: rawPageDetail?.totalPoints ?? rawPageDetail?.TotalPoints ?? 0,
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10
    };

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Questions loaded'),
        questionsList,
        pageDetail,
        totalRecords: pageDetail.totalRecords,
        totalPoints: pageDetail.totalPoints,
        rawData: data
    };
}

export function parseDegreeQuizQuestionsListErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch quiz questions'),
        questionsList: [],
        pageDetail: { totalRecords: 0, totalPoints: 0, pageNo: 1, pageSize: 10 },
        totalRecords: 0,
        totalPoints: 0,
        rawData: data
    };
}

/**
 * 2.7B Parse Degree Quiz Question Master Add/Update Output
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizQuestionMasterAddUpdate
 */
export function parseDegreeQuizQuestionMasterAddUpdateOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);
    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Quiz question saved successfully.' : 'Failed to save quiz question.'),
        questionId: data?.questionId ?? data?.QuestionId ?? data?.questionsId ?? data?.QuestionsId ?? 0,
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseDegreeQuizQuestionMasterAddUpdateErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to save quiz question'),
        errorDescription: resolveErrorDescription(data, 'Server error'),
        rawData: data
    };
}

/**
 * 2.8 & 2.9 Generic response for Toggle Status and Delete Questions
 */
export function parseDegreeQuizQuestionActionOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Action completed successfully.' : 'Action failed.'),
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseDegreeQuizQuestionActionErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Action failed on question'),
        errorDescription: resolveErrorDescription(data, 'Server error'),
        rawData: data
    };
}

/**
 * 2.10 Parse Students for Special Quiz Access Output
 * Endpoint: POST /api/DegreeQuizAPI/GetDegreeStudentsForSpecialQuizAccess
 */
export function parseGetDegreeStudentsForSpecialQuizAccessOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.studentaccessList || data?.StudentaccessList || data?.studentAccessList || [];
    const studentaccessList = Array.isArray(rawList)
        ? rawList.map(item => ({
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            applicantFullName: item?.applicantFullName || item?.ApplicantFullName || item?.studentName || '',
            programeNameAndCode: item?.programeNameAndCode || item?.ProgrameNameAndCode || item?.courseName || '',
            semesterNumber: item?.semesterNumber ?? item?.SemesterNumber ?? 0
        }))
        : [];

    const rawPageDetail = data?.pageDetail || data?.PageDetail || {};
    const pageDetail = {
        totalRecords: rawPageDetail?.totalRecords ?? rawPageDetail?.TotalRecords ?? studentaccessList.length,
        pageNo: rawPageDetail?.pageNo ?? rawPageDetail?.PageNo ?? 1,
        pageSize: rawPageDetail?.pageSize ?? rawPageDetail?.PageSize ?? 10
    };

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Students for special access loaded'),
        studentaccessList,
        pageDetail,
        totalRecords: pageDetail.totalRecords,
        rawData: data
    };
}

export function parseGetDegreeStudentsForSpecialQuizAccessErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch special access students'),
        studentaccessList: [],
        pageDetail: { totalRecords: 0, pageNo: 1, pageSize: 10 },
        totalRecords: 0,
        rawData: data
    };
}

/**
 * 2.11 Parse Microcredential Quiz Category List Output
 * Endpoint: POST /api/DegreeQuizAPI/MicrocredentialQuizCategoryList
 */
export function parseMicrocredentialQuizCategoryListOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.microcredentialQuizCategoryList || data?.MicrocredentialQuizCategoryList || (Array.isArray(data) ? data : []);
    const microcredentialQuizCategoryList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialQuizCategoryId: item?.microcredentialQuizCategoryId ?? item?.MicrocredentialQuizCategoryId ?? item?.id ?? 0,
            microcredentialCategoryName: item?.microcredentialCategoryName || item?.MicrocredentialCategoryName || item?.categoryName || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Quiz categories fetched'),
        microcredentialQuizCategoryList,
        rawData: data
    };
}

export function parseMicrocredentialQuizCategoryListErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch quiz categories'),
        microcredentialQuizCategoryList: [],
        rawData: data
    };
}

// =============================================================================
// SECTION 3: CHECKPOINT QUIZ LIST
// =============================================================================

/**
 * 3.2 Parse Checkpoint Quiz Topics & Detail Modal Output
 * Endpoint: POST /Api/IgnitoMicroCredencialAPI/GetMicroCourseCheckpointQuizTopicDetail
 */
export function parseGetMicroCourseCheckpointQuizTopicDetailOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.getMicroCourseCheckpointQuizTopicDetail || data?.GetMicroCourseCheckpointQuizTopicDetail || (Array.isArray(data) ? data : []);
    const getMicroCourseCheckpointQuizTopicDetail = Array.isArray(rawList)
        ? rawList.map(item => ({
            topicName: item?.topicName || item?.TopicName || '',
            videoTitle: item?.videoTitle || item?.VideoTitle || '',
            topicVideoUrl: item?.topicVideoUrl || item?.TopicVideoUrl || '',
            topicPdf: item?.topicPdf || item?.TopicPdf || '',
            isCheckpointAvailable: Boolean(item?.isCheckpointAvailable ?? item?.IsCheckpointAvailable ?? false),
            microcreditYoutubeDataMasterId: item?.microcreditYoutubeDataMasterId ?? item?.MicrocreditYoutubeDataMasterId ?? item?.videoId ?? 0
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Checkpoint quiz topic details fetched'),
        getMicroCourseCheckpointQuizTopicDetail,
        rawData: data
    };
}

export function parseGetMicroCourseCheckpointQuizTopicDetailErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch checkpoint quiz topic details'),
        getMicroCourseCheckpointQuizTopicDetail: [],
        rawData: data
    };
}

/**
 * 3.3 Parse View AI Checkpoint Quiz Questions & Explanations Output
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizData
 */
export function parseGetMicrocredentialCheckpointQuizDataOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.getMicrocredentialCheckpointQuizDataList || data?.GetMicrocredentialCheckpointQuizDataList || (Array.isArray(data) ? data : []);
    const getMicrocredentialCheckpointQuizDataList = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcredentialYoutubeCheckPointsId: item?.microcredentialYoutubeCheckPointsId ?? item?.MicrocredentialYoutubeCheckPointsId ?? item?.id ?? 0,
            question: item?.question || item?.Question || '',
            checkpointQuizTime: item?.checkpointQuizTime ?? item?.CheckpointQuizTime ?? 0,
            correctAnswerId: item?.correctAnswerId ?? item?.CorrectAnswerId ?? 0,
            answerId: item?.answerId ?? item?.AnswerId ?? 0,
            answer: item?.answer || item?.Answer || '',
            explanation: item?.explanation || item?.Explanation || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Checkpoint quiz data loaded'),
        getMicrocredentialCheckpointQuizDataList,
        rawData: data
    };
}

export function parseGetMicrocredentialCheckpointQuizDataErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch checkpoint quiz questions'),
        getMicrocredentialCheckpointQuizDataList: [],
        rawData: data
    };
}

/**
 * 3.4 & 3.5 Parse Checkpoint Quiz Deletion Output
 */
export function parseDeleteMicrocredentialCheckpointQuizOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Deleted successfully.' : 'Failed to delete.'),
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseDeleteMicrocredentialCheckpointQuizErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to delete checkpoint quiz'),
        errorDescription: resolveErrorDescription(data, 'Server error'),
        rawData: data
    };
}

// =============================================================================
// SECTION 4: ADD CHECKPOINT QUIZ
// =============================================================================

/**
 * 4.3 Parse Get Video Lectures by Course ID Output
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialVideoDetailsByCourseId
 */
export function parseGetMicrocredentialVideoDetailsByCourseIdOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.getMicrocredentialVideoDetails || data?.GetMicrocredentialVideoDetails || (Array.isArray(data) ? data : []);
    const getMicrocredentialVideoDetails = Array.isArray(rawList)
        ? rawList.map(item => ({
            microcreditYoutubeDataMasterId: item?.microcreditYoutubeDataMasterId ?? item?.MicrocreditYoutubeDataMasterId ?? item?.id ?? 0,
            videoTitle: item?.videoTitle || item?.VideoTitle || item?.title || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Video lectures loaded'),
        getMicrocredentialVideoDetails,
        rawData: data
    };
}

export function parseGetMicrocredentialVideoDetailsByCourseIdErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to load video lectures'),
        getMicrocredentialVideoDetails: [],
        rawData: data
    };
}

/**
 * 4.4 Parse Generate AI Microcredential Checkpoint Quiz Output
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GenerateMicrocredentialCheckpointQuiz
 */
export function parseGenerateMicrocredentialCheckpointQuizOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, isSuccess ? 'Microcredential checkpoint quiz generated successfully.' : 'Failed to generate quiz.'),
        errorDescription: !isSuccess ? resolveErrorDescription(data) : '',
        rawData: data
    };
}

export function parseGenerateMicrocredentialCheckpointQuizErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to generate checkpoint quiz'),
        errorDescription: resolveErrorDescription(data, 'AI generation error'),
        rawData: data
    };
}

// =============================================================================
// SECTION 5: CHECKPOINT QUIZ REPORT
// =============================================================================

/**
 * 5.1 Parse Student Checkpoint Quiz Report Table Output
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizReport
 */
export function parseGetMicrocredentialCheckpointQuizReportOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawList = data?.getMicrocredentialCheckpointQuizReportData || data?.GetMicrocredentialCheckpointQuizReportData || [];
    const getMicrocredentialCheckpointQuizReportData = Array.isArray(rawList)
        ? rawList.map(item => ({
            studentId: item?.studentId ?? item?.StudentId ?? 0,
            studentName: item?.studentName || item?.StudentName || '',
            courseName: item?.courseName || item?.CourseName || '',
            topicName: item?.topicName || item?.TopicName || '',
            totalQuestions: Number(item?.totalQuestions ?? item?.TotalQuestions ?? 0),
            correctAnswers: Number(item?.correctAnswers ?? item?.CorrectAnswers ?? 0),
            skippedAnswers: Number(item?.skippedAnswers ?? item?.SkippedAnswers ?? 0),
            incorrectAnswers: Number(item?.incorrectAnswers ?? item?.IncorrectAnswers ?? 0),
            accuracyPercent: Number(item?.accuracyPercent ?? item?.AccuracyPercent ?? 0),
            lastAttemptTime: item?.lastAttemptTime || item?.LastAttemptTime || '',
            microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
            videoId: item?.videoId ?? item?.VideoId ?? 0
        }))
        : [];

    const rawPageDetail = data?.pageDetail || data?.PageDetail || {};
    const pageDetail = {
        totalRecords: rawPageDetail?.totalRecords ?? rawPageDetail?.TotalRecords ?? getMicrocredentialCheckpointQuizReportData.length
    };

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Checkpoint quiz report fetched'),
        getMicrocredentialCheckpointQuizReportData,
        pageDetail,
        totalRecords: pageDetail.totalRecords,
        rawData: data
    };
}

export function parseGetMicrocredentialCheckpointQuizReportErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch checkpoint quiz report'),
        getMicrocredentialCheckpointQuizReportData: [],
        pageDetail: { totalRecords: 0 },
        totalRecords: 0,
        rawData: data
    };
}

/**
 * 5.2 Parse Detailed Student Quiz Responses & Summary Output
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetStudentMicrocredentialQuizResponse
 */
export function parseGetStudentMicrocredentialQuizResponseOutput(rawJson = {}, status = 200) {
    const data = safeParseJson(rawJson);
    const isSuccess = resolveSuccess(data, status);

    const rawSummary = data?.quizSummary || data?.QuizSummary || {};
    const quizSummary = {
        totalQuestions: Number(rawSummary?.totalQuestions ?? rawSummary?.TotalQuestions ?? 0),
        skippedQuestions: Number(rawSummary?.skippedQuestions ?? rawSummary?.SkippedQuestions ?? 0),
        rightQuestions: Number(rawSummary?.rightQuestions ?? rawSummary?.RightQuestions ?? 0),
        wrongQuestions: Number(rawSummary?.wrongQuestions ?? rawSummary?.WrongQuestions ?? 0)
    };

    const rawList = data?.getStudentMicrocredentialQuizResponse || data?.GetStudentMicrocredentialQuizResponse || [];
    const getStudentMicrocredentialQuizResponse = Array.isArray(rawList)
        ? rawList.map(item => ({
            topicName: item?.topicName || item?.TopicName || '',
            question: item?.question || item?.Question || '',
            studentAnswer: item?.studentAnswer || item?.StudentAnswer || '',
            correctAnswer: item?.correctAnswer || item?.CorrectAnswer || '',
            answerStatus: item?.answerStatus || item?.AnswerStatus || '',
            explanation: item?.explanation || item?.Explanation || ''
        }))
        : [];

    return {
        success: isSuccess,
        status,
        message: resolveMessage(data, 'Student quiz responses fetched'),
        quizSummary,
        getStudentMicrocredentialQuizResponse,
        rawData: data
    };
}

export function parseGetStudentMicrocredentialQuizResponseErrorOutput(rawJson = {}, status = 500) {
    const data = safeParseJson(rawJson);
    return {
        success: false,
        status,
        message: resolveMessage(data, 'Failed to fetch student quiz responses'),
        quizSummary: { totalQuestions: 0, skippedQuestions: 0, rightQuestions: 0, wrongQuestions: 0 },
        getStudentMicrocredentialQuizResponse: [],
        rawData: data
    };
}
