/**
 * INPUT PARAMETER FILE: Main Degree Quiz List Input DTO Builder
 * Endpoint: POST /api/DegreeQuizAPI/MainDegreeQuizList
 * 
 * Clean, normalized input DTO builder for fetching the paginated quiz listing.
 * 
 * @param {object} [params={}] - Query and pagination filters
 * @returns {{ headers: object, payload: object, body: string }}
 */
export function buildMainDegreeQuizListInput(params = {}) {
    const opts = (typeof params === 'object' && params !== null && !Array.isArray(params))
        ? params
        : { pageNo: params };

    const pageNo = Number(opts.pageNo ?? opts.PageNo ?? 1) || 1;
    const pageSize = Number(opts.pageSize ?? opts.PageSize ?? 10) || 10;
    const orderByColumn = String(opts.orderByColumn ?? opts.OrderByColumn ?? 'UpdatedOn');
    const orderByDirection = String(opts.orderByDirection ?? opts.OrderByDirection ?? 'DESC');
    const totalRecords = Number(opts.totalRecords ?? opts.TotalRecords ?? 0);
    const searchInput = String(opts.searchInput ?? opts.SearchInput ?? '');
    const educationTypeId = Number(opts.educationTypeId ?? opts.EducationTypeId ?? 2);
    const quizTitle = String(opts.quizTitle ?? opts.QuizTitle ?? '');
    const streamId = Number(opts.streamId ?? opts.StreamId ?? 0);
    const stream = String(opts.stream ?? opts.Stream ?? '');
    const microcredentialCourseId = Number(
        opts.microcredentialCourseId ??
        opts.MicrocredentialCourseId ??
        opts.courseId ??
        opts.CourseId ??
        0
    );
    const microcredentialName = String(
        opts.microcredentialName ??
        opts.MicrocredentialName ??
        opts.courseName ??
        opts.CourseName ??
        ''
    );
    const microcredentialModuleMasterId = Number(
        opts.microcredentialModuleMasterId ??
        opts.MicrocredentialModuleMasterId ??
        opts.moduleMasterId ??
        opts.ModuleMasterId ??
        opts.moduleId ??
        opts.ModuleId ??
        0
    );
    const quizCreaterName = String(
        opts.quizCreaterName ??
        opts.QuizCreaterName ??
        opts.quizCreatedName ??
        opts.QuizCreatedName ??
        opts.creatorName ??
        ''
    );
    const dueDate = String(opts.dueDate ?? opts.DueDate ?? '');
    const adminId = Number(opts.adminId ?? opts.AdminId ?? 0);

    const payload = {
        pageNo,
        pageSize,
        orderByColumn,
        orderByDirection,
        totalRecords,
        searchInput,
        educationTypeId,
        quizTitle,
        streamId,
        stream,
        microcredentialCourseId,
        microcredentialName,
        microcredentialModuleMasterId,
        quizCreaterName,
        dueDate,
        adminId
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

export const mainDegreeQuizListInput = buildMainDegreeQuizListInput;
export default buildMainDegreeQuizListInput;
