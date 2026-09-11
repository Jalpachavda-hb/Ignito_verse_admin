/**
 * TRUSTED BY LOGO SERVICE
 * Connects Admin UI with backend .NET Web API Trusted By Logo module endpoints.
 */

import { apiClient } from './apiClient';
import {
  buildUploadTrustedByLogoInput,
  buildTrustedByLogoAddUpdateInput,
  buildTrustedByLogoListInput,
  buildGetTrustedByLogoImagesInput,
  buildGetTrustedByLogoGetByIdInput,
  buildTrustedByLogoDeleteInput,
} from '../dto/input/trustedByLogoInputs';

import {
  parseUploadTrustedByLogoOutput,
  parseUploadTrustedByLogoErrorOutput,
  parseTrustedByLogoAddUpdateOutput,
  parseTrustedByLogoAddUpdateErrorOutput,
  parseTrustedByLogoListOutput,
  parseTrustedByLogoListErrorOutput,
  parseGetTrustedByLogoImagesOutput,
  parseGetTrustedByLogoImagesErrorOutput,
  parseGetTrustedByLogoGetByIdOutput,
  parseGetTrustedByLogoGetByIdErrorOutput,
  parseTrustedByLogoDeleteOutput,
  parseTrustedByLogoDeleteErrorOutput,
} from '../dto/output/trustedByLogoOutputs';

/**
 * 1. UPLOAD TRUSTED BY LOGO IMAGES
 * API: POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {File|File[]|FileList} files - One or multiple image files
 * @param {string} [oldPath=''] - Old path if replacing
 * @returns {Promise<object>}
 */
/**
 * Automatically compress an image client-side if it exceeds 2MB or 1920px
 * to prevent AWS API Gateway / Lambda 6MB payload limits and ERR_CONNECTION_RESET.
 */
async function compressImageIfNeeded(file, maxDimension = 1920, quality = 0.85, maxSizeBytes = 2 * 1024 * 1024) {
  if (!file || !(file instanceof File) || !file.type.startsWith('image/')) {
    return file;
  }
  if (file.type === 'image/svg+xml' || file.size <= maxSizeBytes) {
    return file;
  }

  try {
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const compressedFile = new File([blob], file.name, {
                  type: outType,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            outType,
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  } catch {
    return file;
  }
}

export async function uploadTrustedByLogoImages(files, oldPath = '') {
  try {
    const fileArray = files instanceof FileList || Array.isArray(files)
      ? Array.from(files)
      : files instanceof File
      ? [files]
      : [];

    if (fileArray.length === 0 && files instanceof FormData) {
      const response = await apiClient('/AdminCommonAPI/CommonUploadFile', {
        method: 'POST',
        body: files,
      });
      if (!response.ok && response.status !== 200) {
        return parseUploadTrustedByLogoErrorOutput(response.data, response.status);
      }
      return parseUploadTrustedByLogoOutput(response.data, response.status);
    }

    if (fileArray.length === 0) {
      return parseUploadTrustedByLogoErrorOutput({ message: 'No files provided for upload' }, 400);
    }

    // Backend CommonUploadFile accepts 1 file per call via input.File
    const uploadPromises = fileArray.map(async (file) => {
      let fileToUpload = file;
      if (file instanceof File && file.type.startsWith('image/')) {
        fileToUpload = await compressImageIfNeeded(file);
      }
      const inputDto = buildUploadTrustedByLogoInput(fileToUpload, oldPath);
      return apiClient('/AdminCommonAPI/CommonUploadFile', {
        method: 'POST',
        headers: inputDto.headers,
        body: inputDto.body,
      });
    });

    const responses = await Promise.all(uploadPromises);

    // Check for any failed upload
    const failedResponse = responses.find((r) => !r.ok || r.status !== 200);
    if (failedResponse) {
      return parseUploadTrustedByLogoErrorOutput(failedResponse.data, failedResponse.status);
    }

    // Aggregate all DocumentHelper results
    const combinedData = [];
    responses.forEach((r) => {
      if (Array.isArray(r.data)) {
        combinedData.push(...r.data);
      } else if (r.data) {
        combinedData.push(r.data);
      }
    });

    return parseUploadTrustedByLogoOutput(combinedData, 200);
  } catch (error) {
    console.error('Error in uploadTrustedByLogoImages:', error);
    return parseUploadTrustedByLogoErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 2. ADD / UPDATE TRUSTED BY LOGO
 * API: POST /api/HomePageAPI/TrustedByLogoAddUpdate
 * 
 * @param {object} payload - `{ adminId, trustedByLogoId, documents }`
 * @returns {Promise<object>}
 */
export async function addUpdateTrustedByLogo(payload = {}) {
  try {
    const inputDto = buildTrustedByLogoAddUpdateInput(payload);
    const response = await apiClient('/HomePageAPI/TrustedByLogoAddUpdate', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body,
    });

    if (!response.ok && response.status !== 200) {
      return parseTrustedByLogoAddUpdateErrorOutput(response.data, response.status);
    }
    return parseTrustedByLogoAddUpdateOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in addUpdateTrustedByLogo:', error);
    return parseTrustedByLogoAddUpdateErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 3. FETCH TRUSTED BY LOGO LIST
 * API: POST /api/HomePageAPI/TrustedByLogoList
 * 
 * @param {object} [options={}] - `{ adminId, pageNo, pageSize, orderByColumn, orderByDirection, searchInput }`
 * @returns {Promise<object>}
 */
export async function getTrustedByLogoList(options = {}) {
  try {
    const inputDto = buildTrustedByLogoListInput(options);
    const response = await apiClient('/HomePageAPI/TrustedByLogoList', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body,
    });

    if (!response.ok && response.status !== 200) {
      return parseTrustedByLogoListErrorOutput(response.data, response.status);
    }
    return parseTrustedByLogoListOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in getTrustedByLogoList:', error);
    return parseTrustedByLogoListErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 4. GET TRUSTED BY LOGO IMAGES FOR PREVIEW MODAL
 * API: POST /api/HomePageAPI/GetTrustedByLogoImages
 * 
 * @param {number} trustedByLogoId
 * @returns {Promise<object>}
 */
export async function getTrustedByLogoImages(trustedByLogoId) {
  try {
    const inputDto = buildGetTrustedByLogoImagesInput(trustedByLogoId);
    const response = await apiClient('/HomePageAPI/GetTrustedByLogoImages', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body,
    });

    if (!response.ok && response.status !== 200) {
      return parseGetTrustedByLogoImagesErrorOutput(response.data, response.status);
    }
    return parseGetTrustedByLogoImagesOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in getTrustedByLogoImages:', error);
    return parseGetTrustedByLogoImagesErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 5. GET TRUSTED BY LOGO BY ID
 * API: POST /api/HomePageAPI/GetTrustedByLogoGetById
 * 
 * @param {number} trustedByLogoId
 * @returns {Promise<object>}
 */
export async function getTrustedByLogoById(trustedByLogoId) {
  try {
    const inputDto = buildGetTrustedByLogoGetByIdInput(trustedByLogoId);
    const endpoint = `/HomePageAPI/GetTrustedByLogoGetById${inputDto.queryString}`;

    let response = await apiClient(endpoint, {
      method: 'POST',
      body: inputDto.formData,
    });

    // Fallback to JSON payload if Form-data returns 415 / 400
    if ((response.status === 415 || response.status === 400) && inputDto.jsonBody) {
      response = await apiClient(endpoint, {
        method: 'POST',
        headers: inputDto.headers,
        body: inputDto.jsonBody,
      });
    }

    if (!response.ok && response.status !== 200) {
      return parseGetTrustedByLogoGetByIdErrorOutput(response.data, response.status);
    }
    return parseGetTrustedByLogoGetByIdOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in getTrustedByLogoById:', error);
    return parseGetTrustedByLogoGetByIdErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 6. DELETE TRUSTED BY LOGO
 * API: POST /api/HomePageAPI/TrustedByLogoDelete
 * 
 * @param {number} trustedByLogoId
 * @param {number} [adminId=1]
 * @returns {Promise<object>}
 */
export async function deleteTrustedByLogo(trustedByLogoId, adminId = 1) {
  try {
    const inputDto = buildTrustedByLogoDeleteInput(trustedByLogoId, adminId);
    const endpoint = `/HomePageAPI/TrustedByLogoDelete${inputDto.queryString}`;

    const response = await apiClient(endpoint, {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body,
    });

    if (!response.ok && response.status !== 200) {
      return parseTrustedByLogoDeleteErrorOutput(response.data, response.status);
    }
    return parseTrustedByLogoDeleteOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in deleteTrustedByLogo:', error);
    return parseTrustedByLogoDeleteErrorOutput({ message: error.message }, 500);
  }
}
