/**
 * ADMIN HOMEPAGE SERVICES
 * Service functions connecting Admin UI with backend .NET Web API Homepage & Testimonial Review endpoints.
 */

import { apiClient } from './apiClient';
import {
  buildUploadHomePageFileInput,
  buildHomePageDetailAddUpdateInput,
  buildAdminHomePageListInput,
  buildHomePageGetByIdInput,
  buildHomePageDataDeleteInput
} from '../dto/input/adminHomePageInputs';

import {
  parseUploadHomePageFileOutput,
  parseUploadHomePageFileErrorOutput,
  parseHomePageDetailAddUpdateOutput,
  parseHomePageDetailAddUpdateErrorOutput,
  parseAdminHomePageListOutput,
  parseAdminHomePageListErrorOutput,
  parseHomePageGetByIdOutput,
  parseHomePageGetByIdErrorOutput,
  parseHomePageDataDeleteOutput,
  parseHomePageDataDeleteErrorOutput,
  formatImageUrl
} from '../dto/output/adminHomePageOutputs';

import {
  buildUploadTestimonialImageInput,
  buildAddUpdateTestimonialReviewInput,
  buildGetTestimonialReviewListInput,
  buildGetTestimonialReviewByIdInput,
  buildDeleteTestimonialReviewInput
} from '../dto/input/testimonialReviewInput';

import {
  parseUploadTestimonialImageOutput,
  parseUploadTestimonialImageErrorOutput,
  parseAddUpdateTestimonialReviewOutput,
  parseAddUpdateTestimonialReviewErrorOutput,
  parseGetTestimonialReviewListOutput,
  parseGetTestimonialReviewListErrorOutput,
  parseGetTestimonialReviewByIdOutput,
  parseGetTestimonialReviewByIdErrorOutput,
  parseDeleteTestimonialReviewOutput,
  parseDeleteTestimonialReviewErrorOutput
} from '../dto/output/testimonialReviewOutput';

// =============================================================================
// 1. HOME PAGE API SERVICES
// =============================================================================

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

/**
 * 1. UPLOAD HOME PAGE FILES
 * Uploads image files (dynamic home section banner images, icon images, "Why Choose Us" icons)
 * API: POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {File|Blob|FormData} file - Binary image file (.jpg, .jpeg, .png)
 * @param {string} [uploadSource='HomeBannerImage'] - "HomeBannerImage" | "HomeIconImage" | "ChooseUsIconImage"
 * @param {string} [oldPath=''] - Old file path if replacing
 * @returns {Promise<object>} Parsed output `{ success, fileList, filePath, fileName, fullUrl, status, rawData }`
 */
export async function uploadHomePageFile(file, uploadSource = 'HomeBannerImage', oldPath = '') {
  try {
    let fileToUpload = file;
    if (file instanceof File && file.type.startsWith('image/')) {
      fileToUpload = await compressImageIfNeeded(file);
    }
    const inputDto = buildUploadHomePageFileInput(fileToUpload, uploadSource, oldPath);

    const response = await apiClient('/AdminCommonAPI/CommonUploadFile', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseUploadHomePageFileErrorOutput(response.data, response.status);
    }

    return parseUploadHomePageFileOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in uploadHomePageFile:', error);
    return parseUploadHomePageFileErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 2. ADD / UPDATE HOME PAGE DETAILS
 * Submits and saves/updates the full home page configuration.
 * API: POST /api/HomePageAPI/HomePageDetailAddUpdate
 * 
 * @param {object} homePageData - Complete Home Page data payload
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, message, statusCode, status, rawData }`
 */
export async function addUpdateHomePageDetail(homePageData = {}) {
  try {
    const inputDto = buildHomePageDetailAddUpdateInput(homePageData);

    const response = await apiClient('/HomePageAPI/HomePageDetailAddUpdate', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseHomePageDetailAddUpdateErrorOutput(response.data, response.status);
    }

    return parseHomePageDetailAddUpdateOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in addUpdateHomePageDetail:', error);
    return parseHomePageDetailAddUpdateErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 3. FETCH HOME PAGE LIST
 * Retrieves a paginated list of Home Page records for display on the admin management grid.
 * API: POST /api/HomePageAPI/HomePageList
 * 
 * @param {object|number} [optionsOrPageNo=1] - Pagination options or page number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [searchText=''] - Search term
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, message, totalRecords, homePageList, status, rawData }`
 */
export async function getAdminHomePageList(
  optionsOrPageNo = 1,
  pageSize = 10,
  searchText = '',
  adminId = 1
) {
  try {
    const inputDto = buildAdminHomePageListInput(optionsOrPageNo, pageSize, searchText, adminId);

    const response = await apiClient('/HomePageAPI/HomePageList', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseAdminHomePageListErrorOutput(response.data, response.status);
    }

    return parseAdminHomePageListOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in getAdminHomePageList:', error);
    return parseAdminHomePageListErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 4. GET HOME PAGE DETAILS BY ID
 * Fetches the detailed data of a specific Home Page entry.
 * API: POST /api/HomePageAPI/HomePageGetById
 * 
 * @param {number} homePageId - Home Page ID
 * @param {number} [adminId=1] - Admin ID
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, homePageData, status, rawData }`
 */
export async function getHomePageById(homePageId = 0, adminId = 1) {
  try {
    const inputDto = buildHomePageGetByIdInput(homePageId, adminId);

    const endpoint = `/HomePageAPI/HomePageGetById${inputDto.queryString}`;
    const response = await apiClient(endpoint, {
      method: 'POST',
      body: inputDto.formData
    });

    if (!response.ok && response.status !== 200) {
      return parseHomePageGetByIdErrorOutput(response.data, response.status);
    }

    return parseHomePageGetByIdOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in getHomePageById:', error);
    return parseHomePageGetByIdErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 5. DELETE HOME PAGE RECORD
 * Deletes a Home Page record by its ID.
 * API: POST /api/HomePageAPI/HomePageDataDelete
 * 
 * @param {number} homePageId - Home Page ID to delete
 * @param {number} [adminId=1] - Admin ID
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, message, status, rawData }`
 */
export async function deleteHomePageData(homePageId = 0, adminId = 1) {
  try {
    const inputDto = buildHomePageDataDeleteInput(homePageId, adminId);

    const response = await apiClient('/HomePageAPI/HomePageDataDelete', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseHomePageDataDeleteErrorOutput(response.data, response.status);
    }

    return parseHomePageDataDeleteOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in deleteHomePageData:', error);
    return parseHomePageDataDeleteErrorOutput({ message: error.message }, 500);
  }
}

// =============================================================================
// 2. TESTIMONIAL REVIEW MODULE API SERVICES
// =============================================================================

/**
 * 1. UPLOAD REVIEWER IMAGE
 * Uploads the reviewer's profile image file (JPG, JPEG, PNG) and returns file metadata.
 * API: POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {File|Blob|FormData} file - Binary image file (.jpg, .jpeg, .png)
 * @param {string} [oldPath=''] - Existing file path to replace
 * @returns {Promise<object>} Parsed output `{ success, fileList, filePath, givenName, originalName, fullUrl, status, rawData }`
 */
export async function uploadTestimonialImage(file, oldPath = '') {
  try {
    let fileToUpload = file;
    if (file instanceof File && file.type.startsWith('image/')) {
      fileToUpload = await compressImageIfNeeded(file);
    }
    const inputDto = buildUploadTestimonialImageInput(fileToUpload, oldPath);

    const response = await apiClient('/AdminCommonAPI/CommonUploadFile', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseUploadTestimonialImageErrorOutput(response.data, response.status);
    }

    return parseUploadTestimonialImageOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in uploadTestimonialImage:', error);
    return parseUploadTestimonialImageErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 2. ADD / UPDATE TESTIMONIAL REVIEW
 * Creates a new testimonial review record or updates an existing one.
 * API: POST /api/AdminSetUpAPI/AddUpdateTestimonialReview
 * 
 * @param {object} reviewData - Testimonial review payload
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, message, status, rawData }`
 */
export async function addUpdateTestimonialReview(reviewData = {}) {
  try {
    const inputDto = buildAddUpdateTestimonialReviewInput(reviewData);

    const response = await apiClient('/AdminSetUpAPI/AddUpdateTestimonialReview', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseAddUpdateTestimonialReviewErrorOutput(response.data, response.status);
    }

    return parseAddUpdateTestimonialReviewOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in addUpdateTestimonialReview:', error);
    return parseAddUpdateTestimonialReviewErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 3. FETCH TESTIMONIAL REVIEW LIST
 * Retrieves a paginated and searchable list of testimonial reviews for admin management.
 * API: POST /api/AdminSetUpAPI/GetTestimonialReviewList
 * 
 * @param {object|number} [optionsOrPageNo=1] - Pagination options or page number
 * @param {number} [pageSize=10] - Number of items per page
 * @param {string} [searchInput=''] - Search term
 * @param {number} [adminId=1] - Admin identifier
 * @param {string} [orderByColumn='UpdatedOn'] - Order by column
 * @param {string} [orderByDirection='DESC'] - Order direction
 * @param {number} [totalRecords=0] - Total records count
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, message, totalRecords, testimonialReviewList, status, rawData }`
 */
export async function getTestimonialReviewList(
  optionsOrPageNo = 1,
  pageSize = 10,
  searchInput = '',
  adminId = 1,
  orderByColumn = 'UpdatedOn',
  orderByDirection = 'DESC',
  totalRecords = 0
) {
  try {
    const inputDto = buildGetTestimonialReviewListInput(
      optionsOrPageNo,
      pageSize,
      searchInput,
      adminId,
      orderByColumn,
      orderByDirection,
      totalRecords
    );

    const response = await apiClient('/AdminSetUpAPI/GetTestimonialReviewList', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseGetTestimonialReviewListErrorOutput(response.data, response.status);
    }

    return parseGetTestimonialReviewListOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in getTestimonialReviewList:', error);
    return parseGetTestimonialReviewListErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 4. GET TESTIMONIAL REVIEW BY ID
 * Fetches a single testimonial review record details by ID to populate edit form.
 * API: POST /api/AdminSetUpAPI/GetTestimonialReviewById
 * 
 * @param {number} testimonialReviewById - Review identifier
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, review, status, rawData }`
 */
export async function getTestimonialReviewById(testimonialReviewById = 0, adminId = 1) {
  try {
    const inputDto = buildGetTestimonialReviewByIdInput(testimonialReviewById, adminId);

    const endpoint = `/AdminSetUpAPI/GetTestimonialReviewById${inputDto.queryString}`;
    let response = await apiClient(endpoint, {
      method: 'POST',
      body: inputDto.formData
    });

    // Fallback: If backend controller expects application/json (HTTP 415/400)
    if (!response.ok && (response.status === 415 || response.status === 400)) {
      const jsonResponse = await apiClient(endpoint, {
        method: 'POST',
        headers: inputDto.headers,
        body: inputDto.body
      });
      if (jsonResponse.ok) {
        response = jsonResponse;
      }
    }

    if (!response.ok && response.status !== 200) {
      return parseGetTestimonialReviewByIdErrorOutput(response.data, response.status);
    }

    return parseGetTestimonialReviewByIdOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in getTestimonialReviewById:', error);
    return parseGetTestimonialReviewByIdErrorOutput({ message: error.message }, 500);
  }
}

/**
 * 5. DELETE TESTIMONIAL REVIEW
 * Deletes a testimonial review entry by TestimonialReviewMasterId.
 * API: POST /api/AdminSetUpAPI/DeleteTestimonialReview
 * 
 * @param {number} testimonialReviewMasterId - Review ID to delete
 * @param {number} [adminId=1] - Admin identifier
 * @returns {Promise<object>} Parsed output `{ success, isSuccess, message, status, rawData }`
 */
export async function deleteTestimonialReview(testimonialReviewMasterId = 0, adminId = 1) {
  try {
    const inputDto = buildDeleteTestimonialReviewInput(testimonialReviewMasterId, adminId);

    const endpoint = `/AdminSetUpAPI/DeleteTestimonialReview${inputDto.queryString || ''}`;
    const response = await apiClient(endpoint, {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body
    });

    if (!response.ok && response.status !== 200) {
      return parseDeleteTestimonialReviewErrorOutput(response.data, response.status);
    }

    return parseDeleteTestimonialReviewOutput(response.data, response.status);
  } catch (error) {
    console.error('Error in deleteTestimonialReview:', error);
    return parseDeleteTestimonialReviewErrorOutput({ message: error.message }, 500);
  }
}

// =============================================================================
// CONVENIENT EXPORT ALIASES
// =============================================================================

// Homepage aliases
export const commonUploadFile = uploadHomePageFile;
export const homePageDetailAddUpdate = addUpdateHomePageDetail;
export const fetchHomePageList = getAdminHomePageList;
export const homePageList = getAdminHomePageList;
export const homePageGetById = getHomePageById;
export const homePageDataDelete = deleteHomePageData;

// Testimonial aliases
export const getTestimonialReviewLists = getTestimonialReviewList;
export const fetchTestimonialReviewList = getTestimonialReviewList;
export const deleteTestimonial = deleteTestimonialReview;
export const addTestimonialReview = addUpdateTestimonialReview;
export const updateTestimonialReview = addUpdateTestimonialReview;

export { formatImageUrl };
