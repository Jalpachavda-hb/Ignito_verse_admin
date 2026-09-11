/**
 * OUTPUT PARAMETER FILE: Download Micro Template Output DTO Parser
 * Parses response blob data for DownloadMicroTemplate GET request.
 * 
 * @param {Blob|any} rawData - Response data (Blob or error)
 * @param {number} status - HTTP status code
 * @param {boolean} [autoDownload=true] - Whether to automatically trigger browser download
 * @param {string} [fileName='MicroCourse_Template.xlsx'] - Download filename
 * @returns {object} Formatted output DTO with blob and file metadata
 */
export function parseDownloadMicroTemplateOutput(
    rawData = null,
    status = 200,
    autoDownload = true,
    fileName = 'MicroCourse_Template.xlsx'
) {
    const isHttpOk = status >= 200 && status < 300;
    const blob = rawData instanceof Blob ? rawData : null;

    if (isHttpOk && blob && autoDownload && typeof window !== 'undefined') {
        try {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Auto download trigger error:', err);
        }
    }

    return {
        success: isHttpOk && Boolean(blob),
        status,
        blob,
        fileName,
        rawData
    };
}

export function parseDownloadMicroTemplateErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: typeof rawJson === 'string' ? rawJson : (rawJson?.message || 'Failed to download micro template'),
        blob: null,
        fileName: 'MicroCourse_Template.xlsx',
        rawData: rawJson
    };
}
