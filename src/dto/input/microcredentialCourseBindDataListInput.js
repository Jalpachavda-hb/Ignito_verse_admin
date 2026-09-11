export function buildMicrocredentialCourseBindDataListInput(
    pageNo = 1,
    pageSize = 10,
    orderByColumn = 'UpdatedOn',
    orderByDirection = 'DESC',
    totalRecords = 0,
    searchInput = "",
    streamId = 0,
    isAllSelect = false,
    selectedLevelIds = '',
    microcredentialCourseId = 0

) {
  
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
        pageNo: pageNo,
        pageSize: pageSize,
        orderByColumn: orderByColumn,
        orderByDirection: orderByDirection,
        totalRecords: totalRecords,
        searchInput: searchInput,
        streamId: streamId,
        isAllSelect: isAllSelect,
        selectedLevelIds: selectedLevelIds,
        microcredentialCourseId: microcredentialCourseId
    })
  };
}