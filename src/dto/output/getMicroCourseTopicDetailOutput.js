export function parseGetMicroCourseTopicDetailOutput(rawJson = {}, status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  const rawTopicList = rawJson.getMicroCourseTopicDetailList || rawJson.GetMicroCourseTopicDetailList || rawJson.topicList || rawJson.microCourseTopicDetailList || [];

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || '',
    errorDescription: rawJson?.errorDescription || '',
    errorNo: rawJson?.errorNo || 0,
    streamId:
      rawJson?.streamId ??
      rawJson?.StreamId ??
      rawJson?.data?.streamId ??
      rawJson?.data?.StreamId ??
      rawJson?.microcredentialCourseStreamId ??
      rawJson?.MicrocredentialCourseStreamId ??
      rawTopicList?.[0]?.streamId ??
      rawTopicList?.[0]?.StreamId ??
      0,
    streamName:
      rawJson?.streamName ||
      rawJson?.StreamName ||
      rawJson?.data?.streamName ||
      rawJson?.data?.StreamName ||
      rawTopicList?.[0]?.streamName ||
      rawTopicList?.[0]?.StreamName ||
      '',
    microcredentialCourseId:
      rawJson?.microcredentialCourseId ??
      rawJson?.MicrocredentialCourseId ??
      rawJson?.data?.microcredentialCourseId ??
      rawJson?.data?.MicrocredentialCourseId ??
      rawTopicList?.[0]?.microcredentialCourseId ??
      rawTopicList?.[0]?.MicrocredentialCourseId ??
      0,
    microcredentialCourseName:
      rawJson?.microcredentialCourseName ||
      rawJson?.MicrocredentialCourseName ||
      rawJson?.data?.microcredentialCourseName ||
      rawJson?.data?.MicrocredentialCourseName ||
      rawTopicList?.[0]?.microcredentialCourseName ||
      rawTopicList?.[0]?.MicrocredentialCourseName ||
      '',
    uploadMicroDocument:
      rawJson?.uploadMicroDocument ||
      rawJson?.UploadMicroDocument ||
      rawJson?.data?.uploadMicroDocument ||
      rawJson?.data?.UploadMicroDocument ||
      '',
    getMicroCourseTopicDetailList: rawTopicList,
    microcredentialStudentDownloadDocumentList:
      rawJson.microcredentialStudentDownloadDocumentList ||
      rawJson.MicrocredentialStudentDownloadDocumentList ||
      rawJson.studentDownloadDocumentList ||
      [],
    rawData: rawJson
  };
}

export function parseGetMicroCourseTopicDetailErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || 'Failed to get microcredential course topic detail',
        errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
        errorNo: rawJson?.errorNo || status,
        getMicroCourseTopicDetailList : [],
        microcredentialStudentDownloadDocumentList : [],
        rawData: rawJson
    };
}