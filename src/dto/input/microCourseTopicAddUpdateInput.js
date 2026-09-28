/**
 * INPUT PARAMETER FILE: Micro Course Topic Add/Update Input DTO Builder
 * Builds input parameter body for MicroCourseTopicAddUpdate POST request.
 * Matches exact Swagger API schema.
 * 
 * @param {object} [data={}] - Object containing topic add/update parameters
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildMicroCourseTopicAddUpdateInput(data = {}) {
    const rawTopicList = data.microcredentialCourseTopicList || data.MicrocredentialCourseTopicList;
    const microcredentialCourseTopicList = Array.isArray(rawTopicList)
        ? rawTopicList.map(item => {
            const topicId = Number(
                item?.microcredentialCourseTopicId ??
                item?.MicrocredentialCourseTopicId ??
                item?.microCourseTopicId ??
                item?.MicroCourseTopicId ??
                item?.id ??
                0
            );
            const topicName = String(item?.topicName || item?.TopicName || '').trim();
            const videoTitle = String(item?.videoTitle || item?.VideoTitle || '').trim();
            const topicVideoUrl = String(item?.topicVideoUrl || item?.TopicVideoUrl || item?.videoUrl || '').trim();
            const topicPdf = String(item?.topicPdf || item?.TopicPdf || item?.topicDocument || '').trim();

            return {
                microcredentialCourseTopicId: topicId,
                MicrocredentialCourseTopicId: topicId,
                microCourseTopicId: topicId,
                MicroCourseTopicId: topicId,
                topicName,
                TopicName: topicName,
                videoTitle,
                VideoTitle: videoTitle,
                topicVideoUrl,
                TopicVideoUrl: topicVideoUrl,
                topicPdf,
                TopicPdf: topicPdf
            };
        })
        : [];

    const rawDocList = data.microcredentialStudentDownloadDocumentList || data.MicrocredentialStudentDownloadDocumentList;
    const microcredentialStudentDownloadDocumentList = Array.isArray(rawDocList)
        ? rawDocList.map(item => {
            const docId = Number(
                item?.microcredentialStudentDownloadDocumentId ??
                item?.MicrocredentialStudentDownloadDocumentId ??
                item?.documentId ??
                item?.id ??
                0
            );
            const docPath = String(item?.microcredentialStudentDownloadDocument || item?.MicrocredentialStudentDownloadDocument || item?.filePath || '').trim();
            const originalFileName = String(item?.originalFileName || item?.OriginalFileName || '').trim();
            const givenFileName = String(item?.givenFileName || item?.GivenFileName || originalFileName || '').trim();

            return {
                microcredentialStudentDownloadDocumentId: docId,
                MicrocredentialStudentDownloadDocumentId: docId,
                microcredentialStudentDownloadDocument: docPath,
                MicrocredentialStudentDownloadDocument: docPath,
                originalFileName,
                OriginalFileName: originalFileName,
                givenFileName,
                GivenFileName: givenFileName
            };
        })
        : [];

    const courseId = Number(data?.microcredentialCourseId ?? data?.MicrocredentialCourseId ?? 0);
    const moduleId = Number(data?.microcredentialModuleMasterId ?? data?.MicrocredentialModuleMasterId ?? 0);
    const streamId = Number(data?.streamId ?? data?.StreamId ?? 0);
    const adminId = Number(data?.adminId ?? data?.AdminId ?? 1);
    const uploadMicroDocument = String(data?.uploadMicroDocument || data?.UploadMicroDocument || '');

    const payload = {
        microcredentialCourseId: courseId,
        MicrocredentialCourseId: courseId,
        microcredentialModuleMasterId: moduleId,
        MicrocredentialModuleMasterId: moduleId,
        streamId,
        StreamId: streamId,
        adminId,
        AdminId: adminId,
        uploadMicroDocument,
        UploadMicroDocument: uploadMicroDocument,
        microcredentialCourseTopicList,
        MicrocredentialCourseTopicList: microcredentialCourseTopicList,
        microcredentialStudentDownloadDocumentList,
        MicrocredentialStudentDownloadDocumentList: microcredentialStudentDownloadDocumentList
    };

    return {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    };
}
