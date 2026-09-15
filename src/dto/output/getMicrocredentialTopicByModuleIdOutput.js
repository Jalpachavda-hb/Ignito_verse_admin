/**
 * OUTPUT PARAMETER FILE: Get Microcredential Topic By Module ID Output DTO Parser
 * Parses response for GetMicrocredentialTopicByModuleId POST request.
 * 
 * @param {object} rawJson - Raw API response
 * @param {number} status - HTTP status code
 * @returns {object} Standardized topics by module response
 */
export function parseGetMicrocredentialTopicByModuleIdOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.IsSuccess ?? isHttpOk);

  const rawList =
    rawJson?.microcredentialTopicList ||
    rawJson?.MicrocredentialTopicList ||
    rawJson?.topicList ||
    rawJson?.data ||
    [];

  const microcredentialTopicList = Array.isArray(rawList)
    ? rawList.map(item => ({
        microCourseTopicId: item?.microCourseTopicId ?? item?.MicroCourseTopicId ?? 0,
        microcredentialModuleMasterId: item?.microcredentialModuleMasterId ?? item?.MicrocredentialModuleMasterId ?? 0,
        microcredentialCourseId: item?.microcredentialCourseId ?? item?.MicrocredentialCourseId ?? 0,
        microcreditYoutubeDataMasterId: item?.microcreditYoutubeDataMasterId ?? item?.MicrocreditYoutubeDataMasterId ?? 0,
        topicName: item?.topicName || item?.TopicName || '',
        videoTitle: item?.videoTitle || item?.VideoTitle || '',
        topicVideoUrl: item?.topicVideoUrl || item?.TopicVideoUrl || item?.videoUrl || item?.watchVideoURL || '',
        topicPdf: item?.topicPdf || item?.TopicPdf || item?.topicDocument || item?.document || '',
        videoStartTime: item?.videoStartTime || item?.VideoStartTime || '',
        videoEndTime: item?.videoEndTime || item?.VideoEndTime || ''
      }))
    : [];

  return {
    success: isSuccess,
    status,
    message: rawJson?.message || rawJson?.Message || '',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || '',
    microcredentialTopicList,
    rawData: rawJson
  };
}

export function parseGetMicrocredentialTopicByModuleIdErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to fetch topics by module',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Server error',
    microcredentialTopicList: [],
    rawData: rawJson
  };
}
