/**
 * INPUT PARAMETER FILE: Finalize Degree Quiz Add/Update Input DTO Builder
 * Endpoint: POST /api/DegreeQuizAPI/FinalizeDegreeQuizAddUpdate
 * 
 * Prepares the composite payload structure for FinalizeDegreeQuizAddUpdate API,
 * matching nested section models and root-level properties according to backend contract.
 * 
 * @param {object} [params={}] - Raw input values from form state
 * @returns {{ headers: object, payload: object, body: string }}
 */

/**
 * Normalizes date to clean YYYY-MM-DD string
 */
export function formatDateOnly(val) {
    if (!val) return '';
    const str = String(val).trim();
    if (!str) return '';
    if (str.includes('T')) {
        return str.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
        return str.substring(0, 10);
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    return str;
}

/**
 * Normalizes time to 24-hour HH:mm string (backend preferred format, e.g. "16:00")
 */
export function formatTime24(timeVal) {
    if (!timeVal) return '';
    const str = String(timeVal).trim();
    if (!str) return '';
    const ampmMatch = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (ampmMatch) {
        let hour = parseInt(ampmMatch[1], 10);
        const minute = ampmMatch[2];
        const period = (ampmMatch[3] || '').toUpperCase();
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return `${String(hour).padStart(2, '0')}:${minute}`;
    }
    return str;
}

/**
 * Normalizes time to clean 12-hour hh:mm AM/PM string (for display)
 */
export function formatTimeOnly(timeVal) {
    if (!timeVal) return '';
    const str = String(timeVal).trim();
    if (!str) return '';
    if (/am|pm/i.test(str)) return str;
    const match = str.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
        let hour = parseInt(match[1], 10);
        const minute = match[2];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
    }
    return str;
}

/**
 * Resolves TimeLimitExpiryActionId string identifier (for sub-lists if needed):
 * - Automatically submit the quiz attempt -> "autoSubmit"
 * - Flag as "exceeded time limit" -> "flagExceeded"
 * - Do nothing -> "doNothingAction"
 */
function resolveTimeLimitExpiryActionId(raw) {
    if (!raw && raw !== 0) return 'autoSubmit';
    const str = String(raw).trim().toLowerCase();
    if (str === '0' || str.includes('submit')) return 'autoSubmit';
    if (str === '1' || str.includes('flag') || str.includes('exceeded')) return 'flagExceeded';
    if (str === '2' || str.includes('nothing')) return 'doNothingAction';
    if (raw === 'autoSubmit' || raw === 'flagExceeded' || raw === 'doNothingAction') return raw;
    return String(raw);
}

/**
 * Resolves root TimeLimitExpiryActionId numeric (Int64) value:
 * Backend DTO contract explicitly requires System.Nullable<System.Int64> for $.TimeLimitExpiryActionId:
 * - 1: Automatically submit the quiz attempt ("autoSubmit")
 * - 2: Flag as "exceeded time limit" ("flagExceeded")
 * - 3: Do nothing ("doNothingAction")
 */
function resolveTimeLimitExpiryActionIdNumeric(raw) {
    if (typeof raw === 'number' && !isNaN(raw)) {
        return raw <= 0 ? 1 : raw;
    }
    const str = String(raw || '').trim().toLowerCase();
    if (str === 'autosubmit' || str.includes('submit') || str === '1' || str === '0') return 1;
    if (str === 'flagexceeded' || str.includes('flag') || str.includes('exceeded') || str === '2') return 2;
    if (str === 'donothingaction' || str.includes('nothing') || str === '3') return 3;
    const n = Number(raw);
    return (!isNaN(n) && n > 0) ? n : 1;
}

export function buildFinalizeDegreeQuizAddUpdateInput(params = {}) {
    let opts = (typeof params === 'object' && params !== null && !Array.isArray(params)) ? params : {};
    if (opts.payload && typeof opts.payload === 'object' && !Array.isArray(opts.payload)) {
        opts = opts.payload;
    }

    // Basic identifiers
    const cleanQuizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const cleanAdminId = Number(opts.adminId ?? opts.AdminId ?? 1);

    // 1. Basic Info sub-object: Exactly matching the 18 master payload fields
    const basic = (typeof (opts.quizBasicInfo ?? opts.QuizBasicInfo) === 'object' && (opts.quizBasicInfo ?? opts.QuizBasicInfo) !== null)
        ? (opts.quizBasicInfo ?? opts.QuizBasicInfo)
        : {};

    const quizTitle = String(basic.quizTitle ?? basic.QuizTitle ?? opts.quizTitle ?? opts.QuizTitle ?? '');
    const gradeOutOf = Number(basic.gradeOutOf ?? basic.GradeOutOf ?? opts.gradeOutOf ?? opts.GradeOutOf ?? 0);
    const rawTotalQ = basic.totalQuestionsGradeOutOf ?? basic.TotalQuestionsGradeOutOf ?? opts.totalQuestionsGradeOutOf ?? opts.TotalQuestionsGradeOutOf;
    const totalQuestionsGradeOutOf = (rawTotalQ !== undefined && rawTotalQ !== null && rawTotalQ !== '' && Number(rawTotalQ) > 0)
        ? Number(rawTotalQ)
        : gradeOutOf;
    const dueDate = formatDateOnly(basic.dueDate ?? basic.DueDate ?? opts.dueDate ?? opts.DueDate ?? '');
    const quizDescription = String(basic.quizDescription ?? basic.QuizDescription ?? opts.quizDescription ?? opts.QuizDescription ?? '');
    const educationTypeId = Number(basic.educationTypeId ?? basic.EducationTypeId ?? opts.educationTypeId ?? opts.EducationTypeId ?? 2);
    const streamId = Number(basic.streamId ?? basic.StreamId ?? opts.streamId ?? opts.StreamId ?? 0);
    const programId = Number(basic.programId ?? basic.ProgramId ?? opts.programId ?? opts.ProgramId ?? 0);
    const courseDetailsId = Number(basic.courseDetailsId ?? basic.CourseDetailsId ?? opts.courseDetailsId ?? opts.CourseDetailsId ?? 0);
    const gradeScheme = Number(basic.gradeScheme ?? basic.GradeScheme ?? opts.gradeScheme ?? opts.GradeScheme ?? 0);
    const gradeBook = String(basic.gradeBook ?? basic.GradeBook ?? opts.gradeBook ?? opts.GradeBook ?? 'Not in Grade Book');
    const yearRange = String(basic.yearRange ?? basic.YearRange ?? opts.yearRange ?? opts.YearRange ?? '2025 - 2026');
    const semesterId = Number(basic.semesterId ?? basic.SemesterId ?? opts.semesterId ?? opts.SemesterId ?? 0);
    const unitId = Number(basic.unitId ?? basic.UnitId ?? opts.unitId ?? opts.UnitId ?? 0);
    const microcredentialCourseId = Number(
        basic.microcredentialCourseId ??
        basic.MicrocredentialCourseId ??
        opts.microcredentialCourseId ??
        opts.MicrocredentialCourseId ??
        0
    );
    const freeCourseId = Number(basic.freeCourseId ?? basic.FreeCourseId ?? opts.freeCourseId ?? opts.FreeCourseId ?? 0);
    const courseTypeId = Number(basic.courseTypeId ?? basic.CourseTypeId ?? opts.courseTypeId ?? opts.CourseTypeId ?? 0);

    const quizBasicInfo = {
        QuizId: cleanQuizId,
        QuizTitle: quizTitle,
        GradeOutOf: gradeOutOf,
        TotalQuestionsGradeOutOf: totalQuestionsGradeOutOf,
        DueDate: dueDate,
        QuizDescription: quizDescription,
        EducationTypeId: educationTypeId,
        StreamId: streamId,
        ProgramId: programId,
        CourseDetailsId: courseDetailsId,
        GradeScheme: gradeScheme,
        GradeBook: gradeBook,
        YearRange: yearRange,
        SemesterId: semesterId,
        UnitId: unitId,
        MicrocredentialCourseId: microcredentialCourseId,
        FreeCourseId: freeCourseId,
        CourseTypeId: courseTypeId
    };

    // 2. Timing and display
    const td = (typeof (opts.quizTimingAndDisplay ?? opts.QuizTimingAndDisplay) === 'object' && (opts.quizTimingAndDisplay ?? opts.QuizTimingAndDisplay) !== null)
        ? (opts.quizTimingAndDisplay ?? opts.QuizTimingAndDisplay)
        : {};

    const quizTimingAndDisplayId = Number(td.quizTimingAndDisplayId ?? td.QuizTimingAndDisplayId ?? opts.quizTimingAndDisplayId ?? opts.QuizTimingAndDisplayId ?? 0);
    const hasTimeLimit = Boolean(td.hasTimeLimit ?? td.HasTimeLimit ?? opts.hasTimeLimit ?? opts.HasTimeLimit ?? false);
    const questionsPerPageId = Number(td.questionsPerPageId ?? td.QuestionsPerPageId ?? opts.questionsPerPageId ?? opts.QuestionsPerPageId ?? 0);
    const preventPreviousBackNavigation = Boolean(td.preventPreviousBackNavigation ?? td.PreventPreviousBackNavigation ?? opts.preventPreviousBackNavigation ?? opts.PreventPreviousBackNavigation ?? false);
    const shuffleQuestionsAndSections = Boolean(td.shuffleQuestionsAndSections ?? td.ShuffleQuestionsAndSections ?? opts.shuffleQuestionsAndSections ?? opts.ShuffleQuestionsAndSections ?? false);
    const allowHints = Boolean(td.allowHints ?? td.AllowHints ?? opts.allowHints ?? opts.AllowHints ?? false);
    const disableInternalMessages = Boolean(td.disableInternalMessages ?? td.DisableInternalMessages ?? opts.disableInternalMessages ?? opts.DisableInternalMessages ?? false);
    const headerDescription = String(td.headerDescription ?? td.HeaderDescription ?? opts.headerDescription ?? opts.HeaderDescription ?? '');
    const footerDescription = String(td.footerDescription ?? td.FooterDescription ?? opts.footerDescription ?? opts.FooterDescription ?? '');

    const quizTimingAndDisplay = {
        QuizTimingAndDisplayId: quizTimingAndDisplayId,
        QuizId: cleanQuizId,
        HasTimeLimit: hasTimeLimit,
        QuestionsPerPageId: questionsPerPageId,
        PreventPreviousBackNavigation: preventPreviousBackNavigation,
        ShuffleQuestionsAndSections: shuffleQuestionsAndSections,
        AllowHints: allowHints,
        DisableInternalMessages: disableInternalMessages,
        HeaderDescription: headerDescription,
        FooterDescription: footerDescription
    };

    // 3. Attempts and completion settings
    const ac = (typeof (opts.attemptsAndCompletionSettings ?? opts.AttemptsAndCompletionSettings) === 'object' && (opts.attemptsAndCompletionSettings ?? opts.AttemptsAndCompletionSettings) !== null)
        ? (opts.attemptsAndCompletionSettings ?? opts.AttemptsAndCompletionSettings)
        : {};

    const quizAttemptsAndCompletionSettingsId = Number(ac.quizAttemptsAndCompletionSettingsId ?? ac.QuizAttemptsAndCompletionSettingsId ?? opts.quizAttemptsAndCompletionSettingsId ?? opts.QuizAttemptsAndCompletionSettingsId ?? 0);
    
    // Resolve single AttemptsAllowed (default 1 unless user selected value)
    const rawAttempts = ac.attemptsAllowed ?? ac.AttemptsAllowed ?? opts.attemptsAllowed ?? opts.AttemptsAllowed ?? opts.attemptTry ?? opts.AttemptTry ?? opts.noOfAttempts ?? opts.NoOfAttempts;
    const attemptsAllowed = (rawAttempts !== undefined && rawAttempts !== null && rawAttempts !== '')
        ? Number(rawAttempts)
        : 1;

    const overallGradeCalculationId = Number(ac.overallGradeCalculationId ?? ac.OverallGradeCalculationId ?? opts.overallGradeCalculationId ?? opts.OverallGradeCalculationId ?? 1);
    const allowRetryOnlyIncorrectAnswers = Boolean(ac.allowRetryOnlyIncorrectAnswers ?? ac.AllowRetryOnlyIncorrectAnswers ?? opts.allowRetryOnlyIncorrectAnswers ?? opts.AllowRetryOnlyIncorrectAnswers ?? false);
    const categoryId = Number(ac.categoryId ?? ac.CategoryId ?? opts.categoryId ?? opts.CategoryId ?? 0);
    const notificationEmail = String(ac.notificationEmail ?? ac.NotificationEmail ?? opts.notificationEmail ?? opts.NotificationEmail ?? '');
    const autoCompletionTypeId = String(ac.autoCompletionTypeId ?? ac.AutoCompletionTypeId ?? opts.autoCompletionTypeId ?? opts.AutoCompletionTypeId ?? '1');
    const rawPassingGrade = ac.passingGradePercentage ?? ac.PassingGradePercentage ?? opts.passingGradePercentage ?? opts.PassingGradePercentage;
    const passingGradePercentage = (rawPassingGrade !== undefined && rawPassingGrade !== null && rawPassingGrade !== '' && Number(rawPassingGrade) > 0)
        ? Number(rawPassingGrade)
        : 60;

    const attemptsAndCompletionSettings = {
        QuizAttemptsAndCompletionSettingsId: quizAttemptsAndCompletionSettingsId,
        QuizId: cleanQuizId,
        AttemptsAllowed: attemptsAllowed,
        OverallGradeCalculationId: overallGradeCalculationId,
        AllowRetryOnlyIncorrectAnswers: allowRetryOnlyIncorrectAnswers,
        CategoryId: categoryId,
        NotificationEmail: notificationEmail,
        AutoCompletionTypeId: autoCompletionTypeId,
        PassingGradePercentage: passingGradePercentage
    };

    // 4. Results and display settings
    const rd = (typeof (opts.resultsAndDisplaySettings ?? opts.ResultsAndDisplaySettings) === 'object' && (opts.resultsAndDisplaySettings ?? opts.ResultsAndDisplaySettings) !== null)
        ? (opts.resultsAndDisplaySettings ?? opts.ResultsAndDisplaySettings)
        : {};

    const quizResultsAndDisplaySettingsId = Number(rd.quizResultsAndDisplaySettingsId ?? rd.QuizResultsAndDisplaySettingsId ?? opts.quizResultsAndDisplaySettingsId ?? opts.QuizResultsAndDisplaySettingsId ?? 0);
    const deductPoints = Boolean(rd.deductPoints ?? rd.DeductPoints ?? opts.deductPoints ?? opts.DeductPoints ?? false);
    const deductionInPercentage = Number(rd.deductionInPercentage ?? rd.DeductionInPercentage ?? opts.deductionInPercentage ?? opts.DeductionInPercentage ?? 0);
    const autoPublishResults = Boolean(rd.autoPublishResults ?? rd.AutoPublishResults ?? opts.autoPublishResults ?? opts.AutoPublishResults ?? true);
    
    const isGradeBookInGradeBook = String(opts.gradeBook ?? opts.GradeBook ?? basic.gradeBook ?? basic.GradeBook ?? '')
        .trim()
        .toLowerCase() === 'in grade book';
    const rawSyncGradeBook = rd.syncToGradeBook ?? rd.SyncToGradeBook ?? opts.syncToGradeBook ?? opts.SyncToGradeBook;
    const syncToGradeBook = isGradeBookInGradeBook ? true : Boolean(rawSyncGradeBook ?? false);
    const isAttemptGrade = Boolean(rd.isAttemptGrade ?? rd.IsAttemptGrade ?? opts.isAttemptGrade ?? opts.IsAttemptGrade ?? false);
    const showQuestionsId = Number(rd.showQuestionsId ?? rd.ShowQuestionsId ?? opts.showQuestionsId ?? opts.ShowQuestionsId ?? 0);

    const resultsAndDisplaySettings = {
        QuizResultsAndDisplaySettingsId: quizResultsAndDisplaySettingsId,
        QuizId: cleanQuizId,
        DeductPoints: deductPoints,
        DeductionInPercentage: deductionInPercentage,
        AutoPublishResults: autoPublishResults,
        SyncToGradeBook: syncToGradeBook,
        IsAttemptGrade: isAttemptGrade,
        ShowQuestionsId: showQuestionsId
    };

    // 5. Customize Quiz Results Display In Model
    const cm = (typeof (opts.customizeQuizResultsDisplayseInModel ?? opts.CustomizeQuizResultsDisplayseInModel) === 'object' && (opts.customizeQuizResultsDisplayseInModel ?? opts.CustomizeQuizResultsDisplayseInModel) !== null)
        ? (opts.customizeQuizResultsDisplayseInModel ?? opts.CustomizeQuizResultsDisplayseInModel)
        : {};

    const customizeQuizResultsDisplayseInModelId = Number(cm.customizeQuizResultsDisplayseInModelId ?? cm.CustomizeQuizResultsDisplayseInModelId ?? opts.customizeQuizResultsDisplayseInModelId ?? opts.CustomizeQuizResultsDisplayseInModelId ?? 0);
    const customizeDate = String(cm.customizeDate ?? cm.CustomizeDate ?? opts.customizeDate ?? opts.CustomizeDate ?? '');
    const customizeTimeLimit = String(cm.customizeTimeLimit ?? cm.CustomizeTimeLimit ?? opts.customizeTimeLimit ?? opts.CustomizeTimeLimit ?? '');
    const timeLimitCheckbox = Boolean(cm.timeLimitCheckbox ?? cm.TimeLimitCheckbox ?? opts.timeLimitCheckbox ?? opts.TimeLimitCheckbox ?? false);
    const minutesInTimeLimit = Number(cm.minutesInTimeLimit ?? cm.MinutesInTimeLimit ?? opts.minutesInTimeLimit ?? opts.MinutesInTimeLimit ?? 0);
    const customeMessageinModel = String(
        cm.customeMessageinModel ??
        cm.CustomeMessageinModel ??
        cm.customeMessageInModel ??
        cm.CustomeMessageInModel ??
        opts.customeMessageinModel ??
        opts.CustomeMessageinModel ??
        opts.customeMessageInModel ??
        opts.CustomeMessageInModel ??
        ''
    );
    const dislayAttemptInModel = Boolean(cm.dislayAttemptInModel ?? cm.DislayAttemptInModel ?? opts.dislayAttemptInModel ?? opts.DislayAttemptInModel ?? false);
    const displayclassaverageinModel = Boolean(
        cm.displayclassaverageinModel ??
        cm.DisplayclassaverageinModel ??
        cm.displayClassAverageInModel ??
        cm.DisplayClassAverageInModel ??
        opts.displayclassaverageinModel ??
        opts.DisplayclassaverageinModel ??
        opts.displayClassAverageInModel ??
        opts.DisplayClassAverageInModel ??
        false
    );
    const displaygradedistributioninModel = Boolean(
        cm.displaygradedistributioninModel ??
        cm.DisplaygradedistributioninModel ??
        cm.displayGradeDistributionInModel ??
        cm.DisplayGradeDistributionInModel ??
        opts.displaygradedistributioninModel ??
        opts.DisplaygradedistributioninModel ??
        opts.displayGradeDistributionInModel ??
        opts.DisplayGradeDistributionInModel ??
        false
    );
    const dropOne = Number(cm.dropOne ?? cm.DropOne ?? opts.dropOne ?? opts.DropOne ?? 0);
    const twoCheck1 = Boolean(cm.twoCheck1 ?? cm.TwoCheck1 ?? opts.twoCheck1 ?? opts.TwoCheck1 ?? false);
    const twoCheck2 = Boolean(cm.twoCheck2 ?? cm.TwoCheck2 ?? opts.twoCheck2 ?? opts.TwoCheck2 ?? false);
    const twoCheck3 = Boolean(cm.twoCheck3 ?? cm.TwoCheck3 ?? opts.twoCheck3 ?? opts.TwoCheck3 ?? false);
    const twoCheck4 = Boolean(cm.twoCheck4 ?? cm.TwoCheck4 ?? opts.twoCheck4 ?? opts.TwoCheck4 ?? false);
    const threeCheck1 = Boolean(cm.threeCheck1 ?? cm.ThreeCheck1 ?? opts.threeCheck1 ?? opts.ThreeCheck1 ?? false);
    const threeCheck2 = Boolean(cm.threeCheck2 ?? cm.ThreeCheck2 ?? opts.threeCheck2 ?? opts.ThreeCheck2 ?? false);
    const threeCheck3 = Boolean(cm.threeCheck3 ?? cm.ThreeCheck3 ?? opts.threeCheck3 ?? opts.ThreeCheck3 ?? false);
    const fourCheck1 = Boolean(cm.fourCheck1 ?? cm.FourCheck1 ?? opts.fourCheck1 ?? opts.FourCheck1 ?? false);
    const fourCheck2 = Boolean(cm.fourCheck2 ?? cm.FourCheck2 ?? opts.fourCheck2 ?? opts.FourCheck2 ?? false);
    const fourCheck3 = Boolean(cm.fourCheck3 ?? cm.FourCheck3 ?? opts.fourCheck3 ?? opts.FourCheck3 ?? false);

    const customizeQuizResultsDisplayseInModel = {
        CustomizeQuizResultsDisplayseInModelId: customizeQuizResultsDisplayseInModelId,
        QuizId: cleanQuizId,
        CustomizeDate: customizeDate,
        CustomizeTimeLimit: customizeTimeLimit,
        TimeLimitCheckbox: timeLimitCheckbox,
        MinutesInTimeLimit: minutesInTimeLimit,
        CustomeMessageinModel: customeMessageinModel,
        DislayAttemptInModel: dislayAttemptInModel,
        DisplayclassaverageinModel: displayclassaverageinModel,
        DisplaygradedistributioninModel: displaygradedistributioninModel,
        DropOne: dropOne,
        TwoCheck1: twoCheck1,
        TwoCheck2: twoCheck2,
        TwoCheck3: twoCheck3,
        TwoCheck4: twoCheck4,
        ThreeCheck1: threeCheck1,
        ThreeCheck2: threeCheck2,
        ThreeCheck3: threeCheck3,
        FourCheck1: fourCheck1,
        FourCheck2: fourCheck2,
        FourCheck3: fourCheck3
    };

    // 6. Availability dates and conditions
    const startDate = formatDateOnly(opts.startDate ?? opts.StartDate ?? '');
    const startTime = formatTime24(opts.startTime ?? opts.StartTime ?? '');
    const endDate = formatDateOnly(opts.endDate ?? opts.EndDate ?? '');
    const endTime = formatTime24(opts.endTime ?? opts.EndTime ?? '');
    const password = String(opts.password ?? opts.Password ?? '');
    const allowSelectedUsersAccess = Boolean(opts.allowSelectedUsersAccess ?? opts.AllowSelectedUsersAccess ?? true);
    const allowOnlySpecialAccessUsers = Boolean(opts.allowOnlySpecialAccessUsers ?? opts.AllowOnlySpecialAccessUsers ?? false);

    const rawAvailabilityList = opts.availabilityDatesAndConditionsList ?? opts.AvailabilityDatesAndConditionsList;
    const availabilityDatesAndConditionsList = Array.isArray(rawAvailabilityList) && rawAvailabilityList.length > 0
        ? rawAvailabilityList.map(item => ({
            AvailabilityDatesAndConditionsId: Number(item?.availabilityDatesAndConditionsId ?? item?.AvailabilityDatesAndConditionsId ?? 0),
            QuizId: cleanQuizId,
            StartDate: formatDateOnly(item?.startDate ?? item?.StartDate ?? startDate),
            StartTime: formatTime24(item?.startTime ?? item?.StartTime ?? startTime),
            EndDate: formatDateOnly(item?.endDate ?? item?.EndDate ?? endDate),
            EndTime: formatTime24(item?.endTime ?? item?.EndTime ?? endTime),
            Password: String(item?.password ?? item?.Password ?? password ?? '')
        }))
        : [{
            AvailabilityDatesAndConditionsId: Number(opts.availabilityDatesAndConditionsId ?? opts.AvailabilityDatesAndConditionsId ?? 0),
            QuizId: cleanQuizId,
            StartDate: startDate,
            StartTime: startTime,
            EndDate: endDate,
            EndTime: endTime,
            Password: password
        }];

    // 7. Time Limit List - Mutually exclusive Asynchronous & Synchronous
    const timeLimitMinutes = Number(opts.timeLimitMinutes ?? opts.TimeLimitMinutes ?? (hasTimeLimit ? 120 : 0));
    
    let isSynchronous = false;
    let isAsynchronous = true; // default Asynchronous to true
    
    const rawTimingSync = opts.isSynchronous ?? opts.IsSynchronous;
    const rawTimingAsync = opts.isAsynchronous ?? opts.IsAsynchronous;
    if (rawTimingSync === true || String(rawTimingSync).toLowerCase() === 'true' || opts.timingMode === 'synchronous') {
        isSynchronous = true;
        isAsynchronous = false;
    } else if (rawTimingAsync === false || String(rawTimingAsync).toLowerCase() === 'false') {
        isSynchronous = true;
        isAsynchronous = false;
    } else {
        isAsynchronous = true;
        isSynchronous = false;
    }

    const cleanTimeLimitExpiryActionId = resolveTimeLimitExpiryActionId(opts.timeLimitExpiryActionId ?? opts.TimeLimitExpiryActionId);
    const numericTimeLimitExpiryActionId = resolveTimeLimitExpiryActionIdNumeric(opts.timeLimitExpiryActionId ?? opts.TimeLimitExpiryActionId);

    const rawTimeLimitList = opts.quizTimeLimitList ?? opts.QuizTimeLimitList;
    const quizTimeLimitList = Array.isArray(rawTimeLimitList) && rawTimeLimitList.length > 0
        ? rawTimeLimitList.map(item => {
            const itemSync = item?.isSynchronous ?? item?.IsSynchronous;
            const itemAsync = item?.isAsynchronous ?? item?.IsAsynchronous;
            let finalSync = isSynchronous;
            let finalAsync = isAsynchronous;
            if (itemSync === true || String(itemSync).toLowerCase() === 'true') {
                finalSync = true;
                finalAsync = false;
            } else if (itemAsync === false || String(itemAsync).toLowerCase() === 'false') {
                finalSync = true;
                finalAsync = false;
            } else if (itemAsync === true || String(itemAsync).toLowerCase() === 'true') {
                finalAsync = true;
                finalSync = false;
            }
            return {
                QuizTimeLimitId: Number(item?.quizTimeLimitId ?? item?.QuizTimeLimitId ?? 0),
                QuizTimingAndDisplayId: Number(item?.quizTimingAndDisplayId ?? item?.QuizTimingAndDisplayId ?? quizTimingAndDisplayId),
                TimeLimitMinutes: Number(item?.timeLimitMinutes ?? item?.TimeLimitMinutes ?? timeLimitMinutes),
                IsAsynchronous: finalAsync,
                IsSynchronous: finalSync,
                DisplayStartDate: String(item?.displayStartDate ?? item?.DisplayStartDate ?? '01-01-1900 12:00:00 AM'),
                DisplayEndDate: String(item?.displayEndDate ?? item?.DisplayEndDate ?? ''),
                TimeLimitExpiryActionId: resolveTimeLimitExpiryActionId(item?.timeLimitExpiryActionId ?? item?.TimeLimitExpiryActionId ?? cleanTimeLimitExpiryActionId)
            };
        })
        : [{
            QuizTimeLimitId: Number(opts.quizTimeLimitId ?? opts.QuizTimeLimitId ?? 0),
            QuizTimingAndDisplayId: quizTimingAndDisplayId,
            TimeLimitMinutes: timeLimitMinutes,
            IsAsynchronous: isAsynchronous,
            IsSynchronous: isSynchronous,
            DisplayStartDate: String(opts.displayStartDate ?? opts.DisplayStartDate ?? opts.timeLimitDisplayStartDate ?? opts.TimeLimitDisplayStartDate ?? '01-01-1900 12:00:00 AM'),
            DisplayEndDate: String(opts.displayEndDate ?? opts.DisplayEndDate ?? opts.timeLimitDisplayEndDate ?? opts.TimeLimitDisplayEndDate ?? ''),
            TimeLimitExpiryActionId: cleanTimeLimitExpiryActionId
        }];

    // Lists
    const releaseConditionList = Array.isArray(opts.releaseConditionList ?? opts.ReleaseConditionList)
        ? (opts.releaseConditionList ?? opts.ReleaseConditionList)
        : [];
    const ipRestrictionsList = Array.isArray(opts.ipRestrictionsList ?? opts.IPRestrictionsList ?? opts.ip ?? opts.Ip)
        ? (opts.ipRestrictionsList ?? opts.IPRestrictionsList ?? opts.ip ?? opts.Ip)
        : [];
    const specialAccessMasterList = Array.isArray(opts.specialAccessMasterList ?? opts.SpecialAccessMasterList)
        ? (opts.specialAccessMasterList ?? opts.SpecialAccessMasterList)
        : [];
    const specialAccessToUsersList = Array.isArray(opts.specialAccessToUsersList ?? opts.SpecialAccessToUsersList)
        ? (opts.specialAccessToUsersList ?? opts.SpecialAccessToUsersList)
        : [];
    const specialUserAttemptsAllowedList = Array.isArray(opts.specialUserAttemptsAllowedList ?? opts.SpecialUserAttemptsAllowedList)
        ? (opts.specialUserAttemptsAllowedList ?? opts.SpecialUserAttemptsAllowedList)
        : [];
    const specialAccessUsersList = Array.isArray(opts.specialAccessUsersList ?? opts.SpecialAccessUsersList)
        ? (opts.specialAccessUsersList ?? opts.SpecialAccessUsersList)
        : [];
    const attemptConditionsList = Array.isArray(opts.attemptConditionsList ?? opts.AttemptConditionsList)
        ? (opts.attemptConditionsList ?? opts.AttemptConditionsList)
        : [];
    const attemptConditionData = Array.isArray(opts.attemptConditionData ?? opts.AttemptConditionData)
        ? (opts.attemptConditionData ?? opts.AttemptConditionData)
        : [];
    const releaseConditionData = Array.isArray(opts.releaseConditionData ?? opts.ReleaseConditionData)
        ? (opts.releaseConditionData ?? opts.ReleaseConditionData)
        : [];
    const specialUserAttemptData = Array.isArray(opts.specialUserAttemptData ?? opts.SpecialUserAttemptData)
        ? (opts.specialUserAttemptData ?? opts.SpecialUserAttemptData)
        : [];
    const specialAccessUserData = Array.isArray(opts.specialAccessUserData ?? opts.SpecialAccessUserData)
        ? (opts.specialAccessUserData ?? opts.SpecialAccessUserData)
        : [];

    // Assemble the complete Finalize payload
    const payload = {
        QuizBasicInfo: quizBasicInfo,
        QuizTimingAndDisplay: quizTimingAndDisplay,
        AttemptsAndCompletionSettings: attemptsAndCompletionSettings,
        ResultsAndDisplaySettings: resultsAndDisplaySettings,
        CustomizeQuizResultsDisplayseInModel: customizeQuizResultsDisplayseInModel,
        CustomizeQuizResultsDisplayseData: [customizeQuizResultsDisplayseInModel],
        AvailabilityDatesAndConditionsList: availabilityDatesAndConditionsList,
        ReleaseConditionList: releaseConditionList,
        IPRestrictionsList: ipRestrictionsList,
        SpecialAccessMasterList: specialAccessMasterList,
        SpecialAccessToUsersList: specialAccessToUsersList,
        SpecialUserAttemptsAllowedList: specialUserAttemptsAllowedList,
        SpecialAccessUsersList: specialAccessUsersList,
        QuizTimeLimitList: quizTimeLimitList,
        AttemptConditionsList: attemptConditionsList,
        IsSuccess: Boolean(opts.isSuccess ?? opts.IsSuccess ?? false),
        Message: String(opts.message ?? opts.Message ?? ''),
        ErrorDescription: String(opts.errorDescription ?? opts.ErrorDescription ?? ''),
        ErrorNo: Number(opts.errorNo ?? opts.ErrorNo ?? 0),
        dropOne: dropOne,
        HeaderDescription: headerDescription,
        FooterDescription: footerDescription,
        AttemptConditionData: attemptConditionData,
        AttemptsAllowed: attemptsAllowed,
        OverallGradeCalculationId: overallGradeCalculationId,
        AllowRetryOnlyIncorrectAnswers: allowRetryOnlyIncorrectAnswers,
        CustomizeDate: customizeDate,
        CustomizeTimeLimit: customizeTimeLimit,
        timeLimitCheckbox: timeLimitCheckbox,
        MinutesInTimeLimit: minutesInTimeLimit,
        customeMessageinModel: customeMessageinModel,
        dislayAttemptInModel: dislayAttemptInModel,
        DisplayclassaverageinModel: displayclassaverageinModel,
        DisplaygradedistributioninModel: displaygradedistributioninModel,
        HasTimeLimit: hasTimeLimit,
        TimeLimitMinutes: timeLimitMinutes,
        IsAsynchronous: isAsynchronous,
        IsSynchronous: isSynchronous,
        TimeLimitExpiryActionId: numericTimeLimitExpiryActionId,
        timeLimitExpiryActionId: numericTimeLimitExpiryActionId,
        QuizId: cleanQuizId,
        StartDate: startDate,
        StartTime: startTime,
        EndDate: endDate,
        EndTime: endTime,
        Password: password,
        AllowSelectedUsersAccess: allowSelectedUsersAccess,
        AllowOnlySpecialAccessUsers: allowOnlySpecialAccessUsers,
        QuestionsPerPageId: questionsPerPageId,
        PreventPreviousBackNavigation: preventPreviousBackNavigation,
        ShuffleQuestionsAndSections: shuffleQuestionsAndSections,
        AllowHints: allowHints,
        DisableInternalMessages: disableInternalMessages,
        NotificationEmail: notificationEmail,
        AutoCompletionTypeId: autoCompletionTypeId,
        PassingGradePercentage: passingGradePercentage,
        DeductionInPercentage: deductionInPercentage,
        DeductPoints: deductPoints,
        AutoPublishResults: autoPublishResults,
        SyncToGradeBook: syncToGradeBook,
        IsAttemptGrade: isAttemptGrade,
        ShowQuestionsId: showQuestionsId,
        CategoryId: categoryId,
        ReleaseConditionData: releaseConditionData,
        SpecialUserAttemptData: specialUserAttemptData,
        SpecialAccessUserData: specialAccessUserData
    };

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        payload,
        body: JSON.stringify(payload)
    };
}

export const finalizeDegreeQuizAddUpdateInput = buildFinalizeDegreeQuizAddUpdateInput;
export default buildFinalizeDegreeQuizAddUpdateInput;
