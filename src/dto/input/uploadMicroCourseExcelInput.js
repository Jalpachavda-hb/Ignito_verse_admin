/**
 * INPUT PARAMETER FILE: Upload Micro Course Excel Input DTO Builder
 * Builds FormData body for UploadMicroCourseExcel POST request.
 * 
 * @param {File} file - Excel file object to upload
 * @returns {object} Formatted request headers and FormData body payload
 */
export function buildUploadMicroCourseExcelInput(file) {
    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }
    return {
        headers: {},
        body: formData
    };
}
