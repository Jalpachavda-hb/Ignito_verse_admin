/**
 * INPUT PARAMETER FILE: Degree Quiz Master Add/Update Input DTO Builder
 * Endpoint: POST /api/DegreeQuizAPI/DegreeQuizMasterAddUpdate
 * 
 * Prepares the payload for DegreeQuizMasterAddUpdate API.
 * Contains ONLY the required 18 fields:
 * 1.  QuizId
 * 2.  QuizTitle
 * 3.  GradeOutOf
 * 4.  TotalQuestionsGradeOutOf
 * 5.  DueDate
 * 6.  QuizDescription
 * 7.  EducationTypeId
 * 8.  StreamId
 * 9.  ProgramId
 * 10. CourseDetailsId
 * 11. GradeScheme
 * 12. GradeBook
 * 13. YearRange
 * 14. SemesterId
 * 15. UnitId
 * 16. MicrocredentialCourseId
 * 17. FreeCourseId
 * 18. CourseTypeId
 * 
 * @param {object} [params={}] - Raw input values from frontend form state
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
 * Resolves currently logged-in administrator ID dynamically from sessionStorage or localStorage.
 */
function getSessionAdminId() {
    try {
        const sAdminId = sessionStorage.getItem('ignito_admin_id') || sessionStorage.getItem('adminId') || sessionStorage.getItem('userId');
        if (sAdminId && !isNaN(Number(sAdminId)) && Number(sAdminId) > 0) {
            return Number(sAdminId);
        }
        const sUser = sessionStorage.getItem('ignito_auth_user') || sessionStorage.getItem('user');
        if (sUser) {
            const u = JSON.parse(sUser);
            const id = u?.adminId ?? u?.AdminId ?? u?.id ?? u?.Id ?? u?.userId ?? u?.UserId;
            if (id && !isNaN(Number(id)) && Number(id) > 0) return Number(id);
        }
        const lAdminId = localStorage.getItem('ignito_admin_id') || localStorage.getItem('adminId');
        if (lAdminId && !isNaN(Number(lAdminId)) && Number(lAdminId) > 0) {
            return Number(lAdminId);
        }
        const lUser = localStorage.getItem('ignito_auth_user') || localStorage.getItem('user');
        if (lUser) {
            const u = JSON.parse(lUser);
            const id = u?.adminId ?? u?.AdminId ?? u?.id ?? u?.Id ?? u?.userId ?? u?.UserId;
            if (id && !isNaN(Number(id)) && Number(id) > 0) return Number(id);
        }
    } catch {
        // ignore storage errors
    }
    return 1;
}

export function buildDegreeQuizMasterAddUpdateInput(params = {}) {
    let opts = (typeof params === 'object' && params !== null && !Array.isArray(params)) ? params : {};
    if (opts.payload && typeof opts.payload === 'object' && !Array.isArray(opts.payload)) {
        opts = opts.payload;
    }

    const quizId = Number(opts.quizId ?? opts.QuizId ?? 0);
    const quizTitle = String(opts.quizTitle ?? opts.QuizTitle ?? '');
    const gradeOutOf = Number(opts.gradeOutOf ?? opts.GradeOutOf ?? 0);
    const rawTotalQ = opts.totalQuestionsGradeOutOf ?? opts.TotalQuestionsGradeOutOf;
    const totalQuestionsGradeOutOf = (rawTotalQ !== undefined && rawTotalQ !== null && rawTotalQ !== '' && Number(rawTotalQ) > 0)
        ? Number(rawTotalQ)
        : gradeOutOf;
    const dueDate = formatDateOnly(opts.dueDate ?? opts.DueDate ?? '');
    const quizDescription = String(opts.quizDescription ?? opts.QuizDescription ?? '');
    const educationTypeId = Number(opts.educationTypeId ?? opts.EducationTypeId ?? 2);
    const streamId = Number(opts.streamId ?? opts.StreamId ?? 0);
    const programId = Number(opts.programId ?? opts.ProgramId ?? 0);
    const microcredentialCourseId = Number(
        opts.microcredentialCourseId ??
        opts.MicrocredentialCourseId ??
        opts.courseId ??
        opts.CourseId ??
        opts.quizCourseId ??
        opts.QuizCourseId ??
        opts.microCourseId ??
        opts.MicroCourseId ??
        0
    );
    const microcredentialModuleMasterId = Number(
        opts.microcredentialModuleMasterId ??
        opts.MicrocredentialModuleMasterId ??
        opts.moduleMasterId ??
        opts.ModuleMasterId ??
        opts.moduleId ??
        opts.ModuleId ??
        opts.microcredentialModuleId ??
        opts.MicrocredentialModuleId ??
        0
    );
    // courseDetailsId must always be 0 as specified
    const courseDetailsId = 0;
    const gradeScheme = Number(opts.gradeScheme ?? opts.GradeScheme ?? 0);
    const gradeBook = String(opts.gradeBook ?? opts.GradeBook ?? 'Not in Grade Book');
    const yearRange = String(opts.yearRange ?? opts.YearRange ?? '2025 - 2026');
    const semesterId = Number(opts.semesterId ?? opts.SemesterId ?? 0);
    const unitId = Number(opts.unitId ?? opts.UnitId ?? 0);
    const freeCourseId = Number(opts.freeCourseId ?? opts.FreeCourseId ?? 0);
    const courseTypeId = Number(opts.courseTypeId ?? opts.CourseTypeId ?? 0);
    const createdBy = Number(
        opts.createdBy ??
        opts.CreatedBy ??
        opts.adminId ??
        opts.AdminId ??
        getSessionAdminId()
    );

    const payload = {
        quizId,
        quizTitle,
        gradeOutOf,
        dueDate,
        quizDescription,
        educationTypeId,
        streamId,
        programId,
        semesterId,
        courseDetailsId: 0,
        gradeScheme,
        gradeBook,
        yearRange,
        unitId,
        createdBy,
        microcredentialCourseId,
        microcredentialModuleMasterId,
        courseTypeId,
        freeCourseId
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

export const degreeQuizMasterAddUpdateInput = buildDegreeQuizMasterAddUpdateInput;
export default buildDegreeQuizMasterAddUpdateInput;
