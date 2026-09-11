/**
 * INPUT DTO BUILDERS: Admin Quiz & Checkpoint Quiz Module
 * Builds strongly-typed payload objects and headers for .NET Web API endpoints.
 */

/**
 * Normalizes an argument that can be either an options object or the first positional argument.
 */
function normalizeOptions(firstArg, ...args) {
    if (typeof firstArg === 'object' && firstArg !== null && !Array.isArray(firstArg)) {
        return firstArg;
    }
    return null;
}

// =============================================================================
// SECTION 1: MICROCREDENTIAL QUIZ LIST (MicrocredentialQuizList.js)
// =============================================================================

/**
 * 1.1 Fetch Paginated Microcredential Quiz List Input
 * Endpoint: POST /api/DegreeQuizAPI/MainDegreeQuizList
 */
export function buildMainDegreeQuizListInput(params = {}) {
    const opts = normalizeOptions(params) || { pageNo: params };
    const {
        pageNo = 1,
        pageSize = 10,
        orderByColumn = 'UpdatedOn',
        orderByDirection = 'DESC',
        totalRecords = 0,
        searchInput = '',
        educationTypeId = 2, // 2 = Microcredential
        quizTitle = '',
        stream = '',
        microcredentialName = '',
        quizCreaterName = '',
        dueDate = '',
        adminId = 0
    } = opts;

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            pageNo: Number(pageNo) || 1,
            pageSize: Number(pageSize) || 10,
            orderByColumn: orderByColumn || 'UpdatedOn',
            orderByDirection: orderByDirection || 'DESC',
            totalRecords: Number(totalRecords) || 0,
            searchInput: searchInput || '',
            educationTypeId: Number(educationTypeId) || 2,
            quizTitle: quizTitle || '',
            stream: stream || '',
            microcredentialName: microcredentialName || '',
            quizCreaterName: quizCreaterName || '',
            dueDate: dueDate || '',
            adminId: Number(adminId) || 0,
            AdminId: Number(adminId) || 0
        })
    };
}

/**
 * 1.2 Toggle Quiz Active / Inactive Status Input
 * Endpoint: POST /api/DegreeQuizAPI/ActiveInactiveDegreeQuiz
 */
export function buildActiveInactiveDegreeQuizInput(quizId = 0, isActive = false, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, isActive, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanIsActive = Boolean(opts.isActive ?? opts.IsActive);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            quizId: cleanQuizId,
            IsActive: cleanIsActive,
            isActive: cleanIsActive,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

/**
 * 1.3 Delete Quiz by Quiz ID Input
 * Endpoint: POST /api/DegreeQuizAPI/DeleteDegreeQuizByQuizId
 */
export function buildDeleteDegreeQuizByQuizIdInput(quizId = 0, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            quizId: cleanQuizId,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

// =============================================================================
// SECTION 2: ADD / EDIT MICROCREDENTIAL QUIZ (AddMicrocredentialQuiz.js)
// =============================================================================

/**
 * 2.1 Get Education Type List Input
 * Endpoint: POST /api/AdminCommonAPI/GetEducationType
 */
export function buildGetEducationTypeInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}

/**
 * 2.3 Get Programmes by Stream Input
 * Endpoint: POST /api/ProgramAPI/GetStreamByProgramme
 */
export function buildGetStreamByProgrammeInput(streamId = 0) {
    const opts = normalizeOptions(streamId) || { streamId };
    const cleanStreamId = Number(opts.streamId ?? opts.StreamId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            StreamId: cleanStreamId,
            streamId: cleanStreamId
        })
    };
}

/**
 * 2.5 Add / Update Quiz Master (Step 1) Input
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizMasterAddUpdate
 */
export function buildDegreeQuizMasterAddUpdateInput(params = {}) {
    const opts = normalizeOptions(params) || {};
    const quizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const quizTitle = String(opts.quizTitle ?? opts.QuizTitle ?? '');
    const gradeOutOf = Number(opts.gradeOutOf ?? opts.GradeOutOf ?? 100);
    const dueDate = String(opts.dueDate ?? opts.DueDate ?? '');
    const quizDescription = String(opts.quizDescription ?? opts.QuizDescription ?? '');
    const educationTypeId = Number(opts.educationTypeId ?? opts.EducationTypeId ?? 2);
    const streamId = Number(opts.streamId ?? opts.StreamId ?? 0);
    const programId = Number(opts.programId ?? opts.ProgramId ?? 0);
    const semesterId = Number(opts.semesterId ?? opts.SemesterId ?? 0);
    const courseDetailsId = Number(opts.courseDetailsId ?? opts.CourseDetailsId ?? 0);
    const unitId = Number(opts.unitId ?? opts.UnitId ?? 0);
    const gradeScheme = Number(opts.gradeScheme ?? opts.GradeScheme ?? 1);
    const gradeBook = String(opts.gradeBook ?? opts.GradeBook ?? 'In Grade Book');
    const yearRange = String(opts.yearRange ?? opts.YearRange ?? '');
    const createdBy = Number(opts.createdBy ?? opts.CreatedBy ?? opts.adminId ?? opts.AdminId ?? 0);
    const microcredentialCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: quizId,
            quizId: quizId,
            QuizTitle: quizTitle,
            quizTitle: quizTitle,
            GradeOutOf: gradeOutOf,
            gradeOutOf: gradeOutOf,
            DueDate: dueDate,
            dueDate: dueDate,
            QuizDescription: quizDescription,
            quizDescription: quizDescription,
            EducationTypeId: educationTypeId,
            educationTypeId: educationTypeId,
            StreamId: streamId,
            streamId: streamId,
            ProgramId: programId,
            programId: programId,
            SemesterId: semesterId,
            semesterId: semesterId,
            CourseDetailsId: courseDetailsId,
            courseDetailsId: courseDetailsId,
            UnitId: unitId,
            unitId: unitId,
            GradeScheme: gradeScheme,
            gradeScheme: gradeScheme,
            GradeBook: gradeBook,
            gradeBook: gradeBook,
            YearRange: yearRange,
            yearRange: yearRange,
            CreatedBy: createdBy,
            createdBy: createdBy,
            MicrocredentialCourseId: microcredentialCourseId,
            microcredentialCourseId: microcredentialCourseId
        })
    };
}

/**
 * 2.6 Finalize Quiz & Save Settings Input
 * Endpoint: POST /api/DegreeQuizAPI/FinalizeDegreeQuizAddUpdate
 */
export function buildFinalizeDegreeQuizAddUpdateInput(params = {}) {
    const opts = normalizeOptions(params) || {};
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: Number(opts.quizId ?? opts.QuizId ?? 0),
            quizId: Number(opts.quizId ?? opts.QuizId ?? 0),
            StartDate: opts.startDate ?? opts.StartDate ?? '',
            startDate: opts.startDate ?? opts.StartDate ?? '',
            StartTime: opts.startTime ?? opts.StartTime ?? '',
            startTime: opts.startTime ?? opts.StartTime ?? '',
            EndDate: opts.endDate ?? opts.EndDate ?? '',
            endDate: opts.endDate ?? opts.EndDate ?? '',
            EndTime: opts.endTime ?? opts.EndTime ?? '',
            endTime: opts.endTime ?? opts.EndTime ?? '',
            Password: opts.password ?? opts.Password ?? '',
            password: opts.password ?? opts.Password ?? '',
            AdminId: cleanAdminId,
            adminId: cleanAdminId,
            ReleaseConditionData: Array.isArray(opts.releaseConditionData ?? opts.ReleaseConditionData)
                ? (opts.releaseConditionData ?? opts.ReleaseConditionData)
                : [],
            IPRestrictionsList: Array.isArray(opts.ipRestrictionsList ?? opts.IPRestrictionsList)
                ? (opts.ipRestrictionsList ?? opts.IPRestrictionsList)
                : [],
            AllowSelectedUsersAccess: Boolean(opts.allowSelectedUsersAccess ?? opts.AllowSelectedUsersAccess ?? true),
            AllowOnlySpecialAccessUsers: Boolean(opts.allowOnlySpecialAccessUsers ?? opts.AllowOnlySpecialAccessUsers ?? false),
            SpecialAccessToUsersList: Array.isArray(opts.specialAccessToUsersList ?? opts.SpecialAccessToUsersList)
                ? (opts.specialAccessToUsersList ?? opts.SpecialAccessToUsersList)
                : [],
            SpecialUserAttemptData: Array.isArray(opts.specialUserAttemptData ?? opts.SpecialUserAttemptData)
                ? (opts.specialUserAttemptData ?? opts.SpecialUserAttemptData)
                : [],
            SpecialAccessUserData: Array.isArray(opts.specialAccessUserData ?? opts.SpecialAccessUserData)
                ? (opts.specialAccessUserData ?? opts.SpecialAccessUserData)
                : [],
            HasTimeLimit: Boolean(opts.hasTimeLimit ?? opts.HasTimeLimit ?? false),
            QuestionsPerPageId: Number(opts.questionsPerPageId ?? opts.QuestionsPerPageId ?? 1),
            PreventPreviousBackNavigation: Boolean(opts.preventPreviousBackNavigation ?? opts.PreventPreviousBackNavigation ?? false),
            ShuffleQuestionsAndSections: Boolean(opts.shuffleQuestionsAndSections ?? opts.ShuffleQuestionsAndSections ?? false),
            AllowHints: Boolean(opts.allowHints ?? opts.AllowHints ?? true),
            DisableInternalMessages: Boolean(opts.disableInternalMessages ?? opts.DisableInternalMessages ?? false),
            HeaderDescription: opts.headerDescription ?? opts.HeaderDescription ?? '',
            FooterDescription: opts.footerDescription ?? opts.FooterDescription ?? '',
            TimeLimitMinutes: Number(opts.timeLimitMinutes ?? opts.TimeLimitMinutes ?? 0),
            IsAsynchronous: Boolean(opts.isAsynchronous ?? opts.IsAsynchronous ?? true),
            IsSynchronous: Boolean(opts.isSynchronous ?? opts.IsSynchronous ?? false),
            TimeLimitExpiryActionId: Number(opts.timeLimitExpiryActionId ?? opts.TimeLimitExpiryActionId ?? 1),
            AttemptsAllowed: Number(opts.attemptsAllowed ?? opts.AttemptsAllowed ?? 1),
            OverallGradeCalculationId: Number(opts.overallGradeCalculationId ?? opts.OverallGradeCalculationId ?? 1),
            AllowRetryOnlyIncorrectAnswers: Boolean(opts.allowRetryOnlyIncorrectAnswers ?? opts.AllowRetryOnlyIncorrectAnswers ?? false),
            CategoryId: Number(opts.categoryId ?? opts.CategoryId ?? 0),
            NotificationEmail: opts.notificationEmail ?? opts.NotificationEmail ?? '',
            PassingGradePercentage: Number(opts.passingGradePercentage ?? opts.PassingGradePercentage ?? 70),
            DeductPoints: Boolean(opts.deductPoints ?? opts.DeductPoints ?? false),
            DeductionInPercentage: Number(opts.deductionInPercentage ?? opts.DeductionInPercentage ?? 0),
            AutoPublishResults: Boolean(opts.autoPublishResults ?? opts.AutoPublishResults ?? true),
            SyncToGradeBook: Boolean(opts.syncToGradeBook ?? opts.SyncToGradeBook ?? true)
        })
    };
}

/**
 * 2.7 Get Questions List for Quiz Input
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizQuestionsList
 */
export function buildDegreeQuizQuestionsListInput(params = {}) {
    const opts = normalizeOptions(params) || { quizId: params };
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            quizId: cleanQuizId,
            QuizId: cleanQuizId,
            adminId: cleanAdminId,
            AdminId: cleanAdminId,
            pageNo: Number(opts.pageNo ?? opts.PageNo ?? 1),
            pageSize: Number(opts.pageSize ?? opts.PageSize ?? 10),
            orderByColumn: opts.orderByColumn ?? opts.OrderByColumn ?? 'QuestionsId',
            orderByDirection: opts.orderByDirection ?? opts.OrderByDirection ?? 'DESC',
            totalRecords: Number(opts.totalRecords ?? opts.TotalRecords ?? 0),
            searchInput: opts.searchInput ?? opts.SearchInput ?? ''
        })
    };
}

/**
 * 2.8 Toggle Active/Inactive Status of Question Input
 * Endpoint: POST /api/DegreeQuizAPI/ActiveInactiveDegreeQuizQuestions
 */
export function buildActiveInactiveDegreeQuizQuestionsInput(quizId = 0, questionId = 0, isActive = false, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, questionId, isActive, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanQuestionId = Number(opts.questionId ?? opts.QuestionId ?? 0);
    const cleanIsActive = Boolean(opts.isActive ?? opts.IsActive);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            quizId: cleanQuizId,
            QuestionId: cleanQuestionId,
            questionId: cleanQuestionId,
            IsActive: cleanIsActive,
            isActive: cleanIsActive,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

/**
 * 2.9 Delete Question from Quiz Input
 * Endpoint: POST /api/DegreeQuizAPI/DeleteDegreeQuizQuestions
 */
export function buildDeleteDegreeQuizQuestionsInput(quizId = 0, questionId = 0, adminId = 0) {
    const opts = normalizeOptions(quizId) || { quizId, questionId, adminId };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanQuestionId = Number(opts.questionId ?? opts.QuestionId ?? 0);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            QuizId: cleanQuizId,
            quizId: cleanQuizId,
            QuestionId: cleanQuestionId,
            questionId: cleanQuestionId,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

/**
 * 2.10 Get Students for Special Quiz Access Input
 * Endpoint: POST /api/DegreeQuizAPI/GetDegreeStudentsForSpecialQuizAccess
 */
export function buildGetDegreeStudentsForSpecialQuizAccessInput(params = {}) {
    const opts = normalizeOptions(params) || { quizId: params };
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            pageNo: Number(opts.pageNo ?? opts.PageNo ?? 1),
            pageSize: Number(opts.pageSize ?? opts.PageSize ?? 10),
            orderByColumn: opts.orderByColumn ?? opts.OrderByColumn ?? 'StudentId',
            orderByDirection: opts.orderByDirection ?? opts.OrderByDirection ?? 'asc',
            quizId: cleanQuizId,
            QuizId: cleanQuizId,
            searchInput: opts.searchInput ?? opts.SearchInput ?? ''
        })
    };
}

/**
 * 2.11 Get Microcredential Quiz Categories Input
 * Endpoint: POST /api/DegreeQuizAPI/MicrocredentialQuizCategoryList
 */
export function buildMicrocredentialQuizCategoryListInput() {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    };
}

// =============================================================================
// SECTION 3: CHECKPOINT QUIZ LIST (MicrocredentialCheckpointQuizList.js)
// =============================================================================

/**
 * 3.2 Get Checkpoint Quiz Topics & Detail Modal Input
 * Endpoint: POST /Api/IgnitoMicroCredencialAPI/GetMicroCourseCheckpointQuizTopicDetail
 */
export function buildGetMicroCourseCheckpointQuizTopicDetailInput(microcredentialCourseId = 0) {
    const opts = normalizeOptions(microcredentialCourseId) || { microcredentialCourseId };
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId
        })
    };
}

/**
 * 3.3 View AI Checkpoint Quiz Questions & Explanations Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizData
 */
export function buildGetMicrocredentialCheckpointQuizDataInput(microcreditYoutubeDataMasterId = 0) {
    const opts = normalizeOptions(microcreditYoutubeDataMasterId) || { microcreditYoutubeDataMasterId };
    const cleanVideoId = Number(opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocreditYoutubeDataMasterId: cleanVideoId,
            microcreditYoutubeDataMasterId: cleanVideoId
        })
    };
}

/**
 * 3.4 Delete Checkpoint Quiz by Video Youtube ID Input
 * Endpoint: POST /Api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByYoutubeDataMasterId
 */
export function buildDeleteMicrocredentialCheckpointQuizByYoutubeDataMasterIdInput(microcreditYoutubeDataMasterId = 0) {
    const opts = normalizeOptions(microcreditYoutubeDataMasterId) || { microcreditYoutubeDataMasterId };
    const cleanVideoId = Number(opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocreditYoutubeDataMasterId: cleanVideoId,
            microcreditYoutubeDataMasterId: cleanVideoId
        })
    };
}

/**
 * 3.5 Delete All Checkpoint Quizzes by Course ID Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/DeleteMicrocredentialCheckpointQuizByCourseId
 */
export function buildDeleteMicrocredentialCheckpointQuizByCourseIdInput(microcredentialCourseId = 0) {
    const opts = normalizeOptions(microcredentialCourseId) || { microcredentialCourseId };
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId
        })
    };
}

// =============================================================================
// SECTION 4: ADD CHECKPOINT QUIZ (AddMicrocredentialCheckpointQuiz.js)
// =============================================================================

/**
 * 4.3 Get Video Lectures by Course ID Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialVideoDetailsByCourseId
 */
export function buildGetMicrocredentialVideoDetailsByCourseIdInput(microcredentialCourseId = 0) {
    const opts = normalizeOptions(microcredentialCourseId) || { microcredentialCourseId };
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId
        })
    };
}

/**
 * 4.4 Generate AI Microcredential Checkpoint Quiz Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GenerateMicrocredentialCheckpointQuiz
 */
export function buildGenerateMicrocredentialCheckpointQuizInput(microcreditYoutubeDataMasterId = 0, adminId = 0) {
    const opts = normalizeOptions(microcreditYoutubeDataMasterId) || { microcreditYoutubeDataMasterId, adminId };
    const cleanVideoId = Number(opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            MicrocreditYoutubeDataMasterId: cleanVideoId,
            microcreditYoutubeDataMasterId: cleanVideoId,
            AdminId: cleanAdminId,
            adminId: cleanAdminId
        })
    };
}

// =============================================================================
// SECTION 5: CHECKPOINT QUIZ REPORT (MicrocredentialCheckpointQuizReport.js)
// =============================================================================

/**
 * 5.1 Fetch Student Checkpoint Quiz Report Table Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetMicrocredentialCheckpointQuizReport
 */
export function buildGetMicrocredentialCheckpointQuizReportInput(params = {}) {
    const opts = normalizeOptions(params) || { pageNo: params };
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            pageNo: Number(opts.pageNo ?? opts.PageNo ?? 1),
            pageSize: Number(opts.pageSize ?? opts.PageSize ?? 10),
            orderByColumn: opts.orderByColumn ?? opts.OrderByColumn ?? 'StudentName',
            orderByDirection: opts.orderByDirection ?? opts.OrderByDirection ?? 'asc',
            totalRecords: Number(opts.totalRecords ?? opts.TotalRecords ?? 0),
            searchInput: opts.searchInput ?? opts.SearchInput ?? '',
            adminId: cleanAdminId,
            AdminId: cleanAdminId
        })
    };
}

/**
 * 5.2 Fetch Detailed Student Quiz Responses & Summary Input
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/GetStudentMicrocredentialQuizResponse
 */
export function buildGetStudentMicrocredentialQuizResponseInput(studentId = 0, microcredentialCourseId = 0, videoId = 0) {
    const opts = normalizeOptions(studentId) || { studentId, microcredentialCourseId, videoId };
    const cleanStudentId = Number(opts.studentId ?? opts.StudentId ?? 0);
    const cleanCourseId = Number(opts.microcredentialCourseId ?? opts.MicrocredentialCourseId ?? 0);
    const cleanVideoId = Number(opts.videoId ?? opts.VideoId ?? opts.microcreditYoutubeDataMasterId ?? opts.MicrocreditYoutubeDataMasterId ?? 0);

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            StudentId: cleanStudentId,
            studentId: cleanStudentId,
            MicrocredentialCourseId: cleanCourseId,
            microcredentialCourseId: cleanCourseId,
            VideoId: cleanVideoId,
            videoId: cleanVideoId
        })
    };
}
