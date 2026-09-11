/**
 * OUTPUT PARAMETER FILE: Common Upload File Output DTO Parser
 * Parses response data for CommonUploadFile POST request.
 * 
 * @param {Array|object} rawJson - Raw JSON response array or object from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with document list
 */
export function parseCommonUploadFileOutput(rawJson = [], status = 200) {
    const isHttpOk = status >= 200 && status < 300;
    const rawList = Array.isArray(rawJson)
        ? rawJson
        : (rawJson?.documents || rawJson?.Documents || rawJson?.data || rawJson?.documentList || rawJson?.fileList || []);

    let documentList = [];
    if (Array.isArray(rawList) && rawList.length > 0) {
        documentList = rawList.map(doc => ({
            documentId: doc?.documentId ?? doc?.DocumentId ?? 0,
            originalName: doc?.originalName || doc?.OriginalName || doc?.fileName || doc?.FileName || '',
            givenName: doc?.givenName || doc?.GivenName || doc?.fileName || doc?.FileName || '',
            fileExtension: doc?.fileExtension || doc?.FileExtension || '',
            filePath: doc?.filePath || doc?.FilePath || (typeof doc === 'string' ? doc : ''),
            documentType: doc?.documentType || doc?.DocumentType || ''
        }));
    } else if (rawJson && (rawJson.filePath || rawJson.FilePath || rawJson.path || rawJson.Path || rawJson.url || rawJson.Url || typeof rawJson === 'string')) {
        const p = typeof rawJson === 'string'
            ? rawJson
            : (rawJson.filePath || rawJson.FilePath || rawJson.path || rawJson.Path || rawJson.url || rawJson.Url || '');
        documentList = [{
            documentId: rawJson.documentId || rawJson.DocumentId || 0,
            originalName: rawJson.originalName || rawJson.OriginalName || rawJson.fileName || '',
            givenName: rawJson.givenName || rawJson.GivenName || '',
            fileExtension: '',
            filePath: p,
            documentType: ''
        }];
    }

    const firstFilePath = documentList[0]?.filePath || rawJson?.filePath || rawJson?.FilePath || rawJson?.url || rawJson?.Url || (typeof rawJson === 'string' ? rawJson : '');

    return {
        success: isHttpOk && (documentList.length > 0 || !!firstFilePath),
        status,
        documentList,
        filePath: firstFilePath,
        fileUrl: firstFilePath,
        fullUrl: firstFilePath,
        rawData: rawJson
    };
}

export function parseCommonUploadFileErrorOutput(rawJson = {}, status = 500) {
    return {
        success: false,
        status,
        message: rawJson?.message || rawJson?.Message || 'Failed to upload file',
        errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
        documentList: [],
        filePath: '',
        rawData: rawJson
    };
}
