export function buildGetMicroCourseTopicDetailInput(
    microcredentialCourseId,
    studentId,
    encryptedMicrocredentialCourseId = ''
) {
    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            microcredentialCourseId: microcredentialCourseId,
            studentId: studentId,
            encryptedMicrocredentialCourseId: encryptedMicrocredentialCourseId
        })
    };
}