/**
 * INPUT DTO BUILDER: Microcredential Quiz Student Result List
 * Endpoint: POST /api/IgnitoMicroCredencialAPI/MicrocredentialQuizStudentResultList
 */
export function buildMicrocredentialQuizStudentResultListInput(params = {}) {
    const cleanAdminId = Number(params.adminid ?? params.adminId ?? params.AdminId ?? 0);
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            pageNo: Number(params.pageNo ?? params.PageNo ?? 1),
            pageSize: Number(params.pageSize ?? params.PageSize ?? 10),
            orderByColumn: params.orderByColumn || params.OrderByColumn || 'quizId',
            orderByDirection: params.orderByDirection || params.OrderByDirection || 'desc',
            totalRecords: Number(params.totalRecords ?? params.TotalRecords ?? 0),
            searchInput: params.searchInput || params.SearchInput || '',
            streamId: Number(params.streamId ?? params.StreamId ?? 0),
            adminid: cleanAdminId,
            microcredentialCourseId: Number(params.microcredentialCourseId ?? params.MicrocredentialCourseId ?? 0),
            quizId: Number(params.quizId ?? params.QuizId ?? 0)
        })
    };
}
