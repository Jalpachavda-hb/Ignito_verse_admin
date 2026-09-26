/**
 * INPUT PARAMETER FILE: Micro Course Topic Add/Update Input DTO Builder
 * Builds input parameter body for MicroCourseTopicAddUpdate POST request.
 * Matches exact Swagger API schema.
 * 
 * @param {object} [data={}] - Object containing topic add/update parameters
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicroCourseTopicAddUpdateInput(data = {}) {
    const microcredentialCourseTopicList = Array.isArray(data.microcredentialCourseTopicList || data.MicrocredentialCourseTopicList)
        ? (data.microcredentialCourseTopicList || data.MicrocredentialCourseTopicList).map(item => ({
            topicName: String(item?.topicName || item?.TopicName || '').trim(),
            videoTitle: String(item?.videoTitle || item?.VideoTitle || '').trim(),
            topicVideoUrl: String(item?.topicVideoUrl || item?.TopicVideoUrl || '').trim(),
            topicPdf: String(item?.topicPdf || item?.TopicPdf || '').trim()
        }))
        : [];

    const microcredentialStudentDownloadDocumentList = Array.isArray(data.microcredentialStudentDownloadDocumentList || data.MicrocredentialStudentDownloadDocumentList)
        ? (data.microcredentialStudentDownloadDocumentList || data.MicrocredentialStudentDownloadDocumentList).map(item => ({
            microcredentialStudentDownloadDocument: String(item?.microcredentialStudentDownloadDocument || item?.MicrocredentialStudentDownloadDocument || '').trim(),
            originalFileName: String(item?.originalFileName || item?.OriginalFileName || '').trim(),
            givenFileName: String(item?.givenFileName || item?.GivenFileName || '').trim()
        }))
        : [];

    const payload = {
        microcredentialCourseId: Number(data?.microcredentialCourseId ?? data?.MicrocredentialCourseId ?? 0),
        microcredentialModuleMasterId: Number(data?.microcredentialModuleMasterId ?? data?.MicrocredentialModuleMasterId ?? 0),
        streamId: Number(data?.streamId ?? data?.StreamId ?? 0),
        adminId: Number(data?.adminId ?? data?.AdminId ?? 1),
        uploadMicroDocument: String(data?.uploadMicroDocument || data?.UploadMicroDocument || ''),
        microcredentialCourseTopicList,
        microcredentialStudentDownloadDocumentList
    };

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    };
}
