/**
 * OUTPUT PARAMETER FILE: Trusted By Logo Response DTO Parsers
 * Standardizes responses from .NET Web API Trusted By Logo module endpoints.
 */

import { formatImageUrl } from './adminHomePageOutputs';
export { formatImageUrl };

/**
 * 1. UPLOAD TRUSTED BY LOGO IMAGES OUTPUT DTO PARSER
 * Endpoint: POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {Array|object} rawJson
 * @param {number} status
 * @returns {object}
 */
export function parseUploadTrustedByLogoOutput(rawJson = [], status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const rawList = Array.isArray(rawJson)
    ? rawJson
    : (rawJson?.data || rawJson?.files || rawJson?.documents || [rawJson]);

  const fileList = Array.isArray(rawList)
    ? rawList.filter(Boolean).map((item) => {
        const p = item.filePath || item.FilePath || item.path || item.Path || item.url || item.Url || (typeof item === 'string' ? item : '');
        return {
          originalName: item.originalName || item.fileName || '',
          givenName: item.givenName || item.fileName || '',
          filePath: p,
          fileExtension: item.fileExtension || item.extension || '',
          fullUrl: formatImageUrl(p),
        };
      })
    : [];

  return {
    success: isHttpOk && fileList.length > 0,
    status,
    fileList,
    primaryFile: fileList[0] || null,
    rawData: rawJson,
  };
}

export function parseUploadTrustedByLogoErrorOutput(rawJson = {}, status = 500) {
  let message = rawJson?.message || rawJson?.Message;
  if (!message && rawJson?.errors && typeof rawJson.errors === 'object') {
    const errorVals = Object.values(rawJson.errors).flat();
    if (errorVals.length > 0) {
      message = errorVals.join(', ');
    }
  }
  if (!message) {
    message = rawJson?.title || 'Failed to upload logo file(s)';
  }

  return {
    success: false,
    status,
    fileList: [],
    primaryFile: null,
    message,
    errorDescription: rawJson?.errorDescription || rawJson?.error || message,
    rawData: rawJson,
  };
}

/**
 * 2. ADD / UPDATE TRUSTED BY LOGO OUTPUT DTO PARSER
 * Endpoint: POST /api/HomePageAPI/TrustedByLogoAddUpdate
 * 
 * @param {object} rawJson
 * @param {number} status
 * @returns {object}
 */
export function parseTrustedByLogoAddUpdateOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.success ?? isHttpOk);

  return {
    success: isSuccess,
    isSuccess,
    status,
    message: rawJson?.message || 'Trusted logo saved successfully.',
    rawData: rawJson,
  };
}

export function parseTrustedByLogoAddUpdateErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    status,
    message: rawJson?.message || 'Failed to save trusted logo',
    errorDescription: rawJson?.errorDescription || rawJson?.error || '',
    rawData: rawJson,
  };
}

/**
 * 3. FETCH TRUSTED BY LOGO LIST OUTPUT DTO PARSER
 * Endpoint: POST /api/HomePageAPI/TrustedByLogoList
 * 
 * @param {object} rawJson
 * @param {number} status
 * @returns {object}
 */
export function parseTrustedByLogoListOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);
  const list =
    rawJson?.trustedByLogoList ||
    rawJson?.TrustedByLogoList ||
    rawJson?.data ||
    [];

  const totalRecords =
    rawJson?.pageDetail?.totalRecords ??
    rawJson?.totalRecords ??
    list.length;

  return {
    success: isSuccess,
    isSuccess,
    status,
    message: rawJson?.message || '',
    totalRecords: Number(totalRecords || 0),
    trustedByLogoList: Array.isArray(list) ? list : [],
    rawData: rawJson,
  };
}

export function parseTrustedByLogoListErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    status,
    message: rawJson?.message || 'Failed to fetch trusted logo list',
    errorDescription: rawJson?.errorDescription || rawJson?.error || '',
    totalRecords: 0,
    trustedByLogoList: [],
    rawData: rawJson,
  };
}

/**
 * 4. GET TRUSTED BY LOGO IMAGES OUTPUT DTO PARSER
 * Endpoint: POST /api/HomePageAPI/GetTrustedByLogoImages
 * 
 * @param {object} rawJson
 * @param {number} status
 * @returns {object}
 */
export function parseGetTrustedByLogoImagesOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);
  const list =
    rawJson?.getTrustedByLogoImagesList ||
    rawJson?.GetTrustedByLogoImagesList ||
    rawJson?.data ||
    [];

  const formattedImages = Array.isArray(list)
    ? list.map((item) => {
        const rawPath = item.filePath || item.FilePath || (typeof item === 'string' ? item : '');
        return {
          filePath: rawPath,
          fullUrl: formatImageUrl(rawPath),
        };
      })
    : [];

  return {
    success: isSuccess,
    isSuccess,
    status,
    images: formattedImages,
    primaryImage: formattedImages[0] || null,
    rawData: rawJson,
  };
}

export function parseGetTrustedByLogoImagesErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    status,
    images: [],
    primaryImage: null,
    message: rawJson?.message || 'Failed to fetch logo images',
    rawData: rawJson,
  };
}

/**
 * 5. GET TRUSTED BY LOGO BY ID OUTPUT DTO PARSER
 * Endpoint: POST /api/HomePageAPI/GetTrustedByLogoGetById
 * 
 * @param {object} rawJson
 * @param {number} status
 * @returns {object}
 */
export function parseGetTrustedByLogoGetByIdOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);
  const rawDocs = rawJson?.documents || rawJson?.Documents || [];

  const documents = Array.isArray(rawDocs)
    ? rawDocs.map((doc) => ({
        documentId: doc.documentId ?? doc.DocumentId ?? 0,
        givenName: doc.givenName || doc.fileName || '',
        originalName: doc.originalName || doc.fileName || '',
        filePath: doc.filePath || '',
        fileExtension: doc.fileExtension || doc.extension || '',
        documentType: doc.documentType || 'TrustedByLogoMaltiImages',
        fullUrl: formatImageUrl(doc.filePath || ''),
      }))
    : [];

  return {
    success: isSuccess,
    isSuccess,
    status,
    trustedByLogoId: Number(rawJson?.trustedByLogoId ?? rawJson?.TrustedByLogoId ?? 0),
    documents,
    rawData: rawJson,
  };
}

export function parseGetTrustedByLogoGetByIdErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    status,
    trustedByLogoId: 0,
    documents: [],
    message: rawJson?.message || 'Failed to fetch logo details',
    rawData: rawJson,
  };
}

/**
 * 6. DELETE TRUSTED BY LOGO OUTPUT DTO PARSER
 * Endpoint: POST /api/HomePageAPI/TrustedByLogoDelete
 * 
 * @param {object} rawJson
 * @param {number} status
 * @returns {object}
 */
export function parseTrustedByLogoDeleteOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? rawJson?.success ?? isHttpOk);

  return {
    success: isSuccess,
    isSuccess,
    status,
    message: rawJson?.message || 'TrustedByLogo deleted successfully.',
    rawData: rawJson,
  };
}

export function parseTrustedByLogoDeleteErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    status,
    message: rawJson?.message || 'Failed to delete trusted logo',
    errorDescription: rawJson?.errorDescription || rawJson?.error || '',
    rawData: rawJson,
  };
}
