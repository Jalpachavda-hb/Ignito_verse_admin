/**
 * COMMON UPLOAD SERVICE
 * Centralized service for uploading files & images across the application.
 * Corresponds to .NET Web API CommonUploadFile endpoint with UploadSource enum.
 */

import { apiClient } from './apiClient';
import {
  UploadSource,
  UploadSourceFolderMap,
  buildCommonUploadFileInput,
} from '../dto/input/commonUploadFileInput';
import {
  parseCommonUploadFileOutput,
  parseCommonUploadFileErrorOutput,
} from '../dto/output/commonUploadFileOutput';

export { UploadSource, UploadSourceFolderMap };

/**
 * Uploads one or more files using multipart/form-data.
 * API: POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * Supports both signatures:
 * Signature 1 (Clean/Recommended):
 *   commonUploadFile(files, UploadSource.HomeBannerImage, oldPath)
 * Signature 2 (Legacy):
 *   commonUploadFile(files, 'UploadSource', 'IntroImage', oldPath)
 * 
 * @param {File|File[]|FileList|FormData} files - File or files to upload
 * @param {string} [sourceOrKey=UploadSource.CommonDocument] - UploadSource enum value or legacy key
 * @param {string} [sourceValueOrOldPath=''] - Source value (legacy) or oldPath
 * @param {string} [legacyOldPath=''] - Old file path (legacy)
 * @returns {Promise<{ success: boolean, filePath: string, fileUrl: string, fullUrl: string, documentList: Array, status: number, rawData: any }>}
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

export async function commonUploadFile(
  files,
  sourceOrKey = UploadSource.CommonDocument,
  sourceValueOrOldPath = '',
  legacyOldPath = ''
) {
  try {
    let fileToUpload = files;
    if (files instanceof File && files.type.startsWith('image/')) {
      fileToUpload = await compressImageIfNeeded(files);
    }
    const inputDto = buildCommonUploadFileInput(
      fileToUpload,
      sourceOrKey,
      sourceValueOrOldPath,
      legacyOldPath
    );

    // Primary endpoint: /AdminCommonAPI/CommonUploadFile
    let response = await apiClient('/AdminCommonAPI/CommonUploadFile', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body,
    });

    // Fallback if needed
    if (!response.ok && (response.status === 404 || response.status === 405)) {
      response = await apiClient('api/IgnitoMicroCredencialAPI/CommonUploadFile', {
        method: 'POST',
        headers: inputDto.headers,
        body: inputDto.body,
      });
    }

    if (!response.ok && response.status !== 200) {
      return parseCommonUploadFileErrorOutput(response.data, response.status);
    }

    const outputDto = parseCommonUploadFileOutput(response.data, response.status);
    return outputDto;
  } catch (error) {
    console.error('Error in commonUploadFile:', error);
    return parseCommonUploadFileErrorOutput({ message: error.message }, 500);
  }
}

/**
 * Convenience helper to upload a single image.
 * 
 * @param {File|Blob} file - Image file
 * @param {string} source - UploadSource enum value
 * @param {string} [oldPath=''] - Existing file path to replace
 * @returns {Promise<{ success: boolean, filePath: string, fileUrl: string, fullUrl: string, status: number }>}
 */
export async function uploadImageFile(file, source = UploadSource.IntroImage, oldPath = '') {
  return commonUploadFile(file, source, oldPath);
}

/**
 * Convenience helper to upload multiple files or documents.
 * 
 * @param {FileList|File[]} files - List of files
 * @param {string} source - UploadSource enum value
 * @param {string} [oldPath=''] - Existing file path
 * @returns {Promise<{ success: boolean, documentList: Array, filePath: string, status: number }>}
 */
export async function uploadMultipleFiles(files, source = UploadSource.CommonDocument, oldPath = '') {
  return commonUploadFile(files, source, oldPath);
}
