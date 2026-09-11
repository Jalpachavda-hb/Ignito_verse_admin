/**
 * INPUT PARAMETER FILE: Micro Course Topic Add/Update Input DTO Builder
 * Builds input parameter body for MicroCourseTopicAddUpdate POST request.
 * 
 * @param {object} [data={}] - Object containing topic add/update parameters
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicroCourseTopicAddUpdateInput(data = {}) {
    const microcredentialCourseTopicList = Array.isArray(data.microcredentialCourseTopicList || data.MicrocredentialCourseTopicList)
        ? (data.microcredentialCourseTopicList || data.MicrocredentialCourseTopicList).map(item => ({
            TopicName: item?.TopicName || item?.topicName || '',
            VideoTitle: item?.VideoTitle || item?.videoTitle || '',
            TopicVideoUrl: item?.TopicVideoUrl || item?.topicVideoUrl || '',
            TopicPdf: item?.TopicPdf || item?.topicPdf || '',
            topicName: item?.TopicName || item?.topicName || '',
            videoTitle: item?.VideoTitle || item?.videoTitle || '',
            topicVideoUrl: item?.TopicVideoUrl || item?.topicVideoUrl || '',
            topicPdf: item?.TopicPdf || item?.topicPdf || ''
        }))
        : [];

    const microcredentialStudentDownloadDocumentList = Array.isArray(data.microcredentialStudentDownloadDocumentList || data.MicrocredentialStudentDownloadDocumentList)
        ? (data.microcredentialStudentDownloadDocumentList || data.MicrocredentialStudentDownloadDocumentList).map(item => ({
            OriginalFileName: item?.OriginalFileName || item?.originalFileName || '',
            GivenFileName: item?.GivenFileName || item?.givenFileName || '',
            MicrocredentialStudentDownloadDocument: item?.MicrocredentialStudentDownloadDocument || item?.microcredentialStudentDownloadDocument || '',
            originalFileName: item?.OriginalFileName || item?.originalFileName || '',
            givenFileName: item?.GivenFileName || item?.givenFileName || '',
            microcredentialStudentDownloadDocument: item?.MicrocredentialStudentDownloadDocument || item?.microcredentialStudentDownloadDocument || ''
        }))
        : [];

    const moduleId = Number(data?.MicrocredentialModuleMasterId ?? data?.microcredentialModuleMasterId ?? 0);

    const payload = {
        StreamId: Number(data?.StreamId ?? data?.streamId ?? 0),
        MicrocredentialCourseId: Number(data?.MicrocredentialCourseId ?? data?.microcredentialCourseId ?? 0),
        MicrocredentialModuleMasterId: moduleId,
        AdminId: Number(data?.AdminId ?? data?.adminId ?? 1),
        UploadMicroDocument: data?.UploadMicroDocument || data?.uploadMicroDocument || '',
        MicrocredentialCourseTopicList: microcredentialCourseTopicList,
        MicrocredentialStudentDownloadDocumentList: microcredentialStudentDownloadDocumentList,
        streamId: Number(data?.StreamId ?? data?.streamId ?? 0),
        microcredentialCourseId: Number(data?.MicrocredentialCourseId ?? data?.microcredentialCourseId ?? 0),
        microcredentialModuleMasterId: moduleId,
        adminId: Number(data?.AdminId ?? data?.adminId ?? 1),
        uploadMicroDocument: data?.UploadMicroDocument || data?.uploadMicroDocument || '',
        microcredentialCourseTopicList: microcredentialCourseTopicList,
        microcredentialStudentDownloadDocumentList: microcredentialStudentDownloadDocumentList
    };

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    };
}
