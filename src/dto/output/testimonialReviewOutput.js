/**
 * OUTPUT PARAMETER FILE: Testimonial Review Response DTO Parsers
 * Parses raw HTTP responses from .NET Web API Admin Testimonial endpoints into clean UI data objects.
 */

import { formatImageUrl } from './adminHomePageOutputs';

/**
 * 1. UPLOAD REVIEWER IMAGE OUTPUT DTO PARSER
 * Parses response from POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {Array|object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized upload response with file metadata
 */
export function parseUploadTestimonialImageOutput(rawJson = [], status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const rawList = Array.isArray(rawJson)
    ? rawJson
    : (rawJson?.data || rawJson?.files || rawJson?.documents || [rawJson]);

  const fileList = Array.isArray(rawList)
    ? rawList.filter(Boolean).map(item => ({
        filePath: item.filePath || item.FilePath || item.path || item.Path || item.url || item.Url || (typeof item === 'string' ? item : ''),
        givenName: item.givenName || item.GivenName || '',
        originalName: item.originalName || item.OriginalName || item.fileName || item.FileName || ''
      }))
    : [];

  const primaryFile = fileList[0] || { filePath: '', givenName: '', originalName: '' };

  return {
    success: isHttpOk && (fileList.length > 0 || !!primaryFile.filePath),
    status,
    fileList,
    filePath: primaryFile.filePath,
    givenName: primaryFile.givenName,
    originalName: primaryFile.originalName,
    fullUrl: formatImageUrl(primaryFile.filePath),
    rawData: rawJson
  };
}

export function parseUploadTestimonialImageErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to upload reviewer image',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
    fileList: [],
    filePath: '',
    givenName: '',
    originalName: '',
    fullUrl: '',
    rawData: rawJson
  };
}

/**
 * 2. ADD / UPDATE TESTIMONIAL REVIEW OUTPUT DTO PARSER
 * Parses response from POST /api/AdminSetUpAPI/AddUpdateTestimonialReview
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized result `{ success, isSuccess, message, status, rawData }`
 */
export function parseAddUpdateTestimonialReviewOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  return {
    success: isSuccess,
    isSuccess,
    message: rawJson?.message || (isSuccess ? 'Review saved successfully.' : 'Failed to save review.'),
    status,
    rawData: rawJson
  };
}

export function parseAddUpdateTestimonialReviewErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to save review',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    status,
    rawData: rawJson
  };
}

/**
 * 3. FETCH TESTIMONIAL REVIEW LIST OUTPUT DTO PARSER
 * Parses response from POST /api/AdminSetUpAPI/GetTestimonialReviewList
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized list `{ success, isSuccess, message, totalRecords, testimonialReviewList, testimonialReview, status, rawData }`
 */
export function parseGetTestimonialReviewListOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  const rawList =
    rawJson?.testimonialReviewListOutputParameters ||
    rawJson?.TestimonialReviewListOutputParameters ||
    rawJson?.testimonialReviewLists ||
    rawJson?.TestimonialReviewLists ||
    rawJson?.testimonialReview ||
    rawJson?.data ||
    [];

  const list = Array.isArray(rawList)
    ? rawList.map(item => ({
        testimonialReviewMasterId: item.testimonialReviewMasterId ?? item.TestimonialReviewMasterId ?? item.id ?? item.Id ?? 0,
        reviewerName: item.reviewerName ?? item.ReviewerName ?? item.clientName ?? item.ClientName ?? item.name ?? '',
        reviewerDesignation: item.reviewerDesignation ?? item.ReviewerDesignation ?? item.designation ?? item.Designation ?? '',
        reviewInStar: Number(item.reviewInStar ?? item.ReviewInStar ?? item.rating ?? item.Rating ?? 5),
        reviewDescription: item.reviewDescription ?? item.ReviewDescription ?? item.description ?? item.Description ?? '',
        reviewerImagePath: item.reviewerImagePath ?? item.ReviewerImagePath ?? item.imagePath ?? item.ImagePath ?? item.clientImage ?? item.ClientImage ?? '',
        updatedOn: item.updatedOn ?? item.UpdatedOn ?? item.createdDate ?? item.CreatedDate ?? '',
        ...item
      }))
    : [];

  const total = Number(
    rawJson?.pageDetail?.totalRecords ??
    rawJson?.totalRecords ??
    rawJson?.TotalRecords ??
    list.length
  );

  return {
    success: isSuccess,
    isSuccess,
    message: rawJson?.message || (isSuccess ? 'Data retrieved successfully.' : 'Failed to load reviews.'),
    totalRecords: total,
    testimonialReviewList: list,
    // Aliases for compatibility with existing UI components
    testimonialReview: list,
    testimonialReviewLists: list,
    status,
    rawData: rawJson
  };
}

export function parseGetTestimonialReviewListErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to load testimonial reviews',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    totalRecords: 0,
    testimonialReviewList: [],
    testimonialReview: [],
    testimonialReviewLists: [],
    status,
    rawData: rawJson
  };
}

/**
 * 4. GET TESTIMONIAL REVIEW BY ID OUTPUT DTO PARSER
 * Parses response from POST /api/AdminSetUpAPI/GetTestimonialReviewById
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized review details
 */
export function parseGetTestimonialReviewByIdOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const data = rawJson?.data || rawJson;

  const review = {
    testimonialReviewMasterId: data?.testimonialReviewMasterId ?? data?.TestimonialReviewMasterId ?? 0,
    reviewerName: data?.reviewerName ?? data?.ReviewerName ?? '',
    reviewerDesignation: data?.reviewerDesignation ?? data?.ReviewerDesignation ?? '',
    reviewInStar: Number(data?.reviewInStar ?? data?.ReviewInStar ?? 5),
    reviewDescription: data?.reviewDescription ?? data?.ReviewDescription ?? '',
    reviewerImagePath: data?.reviewerImagePath ?? data?.ReviewerImagePath ?? '',
    givenFileName: data?.givenFileName ?? data?.GivenFileName ?? '',
    originalFileName: data?.originalFileName ?? data?.OriginalFileName ?? '',
    fullImageUrl: formatImageUrl(data?.reviewerImagePath ?? data?.ReviewerImagePath ?? '')
  };

  return {
    success: isHttpOk && Boolean(review.testimonialReviewMasterId || review.reviewerName),
    isSuccess: isHttpOk,
    review,
    data: review,
    status,
    rawData: rawJson
  };
}

export function parseGetTestimonialReviewByIdErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to load review details',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    review: null,
    data: null,
    status,
    rawData: rawJson
  };
}

/**
 * 5. DELETE TESTIMONIAL REVIEW OUTPUT DTO PARSER
 * Parses response from POST /api/AdminSetUpAPI/DeleteTestimonialReview
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized delete response `{ success, isSuccess, message, status, rawData }`
 */
export function parseDeleteTestimonialReviewOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  return {
    success: isSuccess,
    isSuccess,
    message: rawJson?.message || (isSuccess ? 'Review deleted successfully.' : 'Failed to delete review.'),
    status,
    rawData: rawJson
  };
}

export function parseDeleteTestimonialReviewErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to delete review',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    status,
    rawData: rawJson
  };
}

// Backward compatibility aliases
export const parsetestimonialReviewOutput = parseGetTestimonialReviewListOutput;
export const parsetestimonialReviewErrorOutput = parseGetTestimonialReviewListErrorOutput;
export const parseTestimonialReviewOutput = parseGetTestimonialReviewListOutput;
export const parseTestimonialReviewErrorOutput = parseGetTestimonialReviewListErrorOutput;
