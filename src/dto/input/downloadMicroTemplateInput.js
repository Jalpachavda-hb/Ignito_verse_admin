/**
 * INPUT PARAMETER FILE: Download Micro Template Input DTO Builder
 * Builds request options for DownloadMicroTemplate GET request.
 * 
 * @returns {object} Formatted request options
 */
export function buildDownloadMicroTemplateInput() {
    return {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*'
        },
        responseType: 'blob'
    };
}
