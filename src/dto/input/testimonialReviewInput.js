/**
 * INPUT PARAMETER FILE: Testimonial Review Request DTO Builders
 * Constructs input parameters and FormData/JSON payloads for .NET Web API Admin Testimonial endpoints.
 */

/**
 * 1. UPLOAD REVIEWER IMAGE INPUT DTO BUILDER
 * Builds multipart/form-data body for POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {File|Blob|FormData} file - Binary image file (.jpg, .jpeg, .png)
 * @param {string} [oldPath=''] - Existing file path to replace (e.g. "/UploadedFiles/TestimonialImage/old_image.jpg")
 * @returns {{ headers: object, body: FormData }} Formatted multipart request object
 */
export function buildUploadTestimonialImageInput(file, oldPath = '') {
  if (file instanceof FormData) {
    return {
      headers: {},
      body: file
    };
  }

  const formData = new FormData();

  if (file) {
    formData.append('File', file);
  }

  formData.append('source', 'TestimonialImage');
  formData.append('UploadSource', 'TestimonialImage');
  formData.append('uploadSource', 'TestimonialImage');
  formData.append('Source', 'TestimonialImage');

  if (oldPath) {
    formData.append('OldPath', oldPath);
    formData.append('oldPath', oldPath);
  }

  return {
    headers: {},
    body: formData
  };
}

/**
 * 2. ADD / UPDATE TESTIMONIAL REVIEW INPUT DTO BUILDER
 * Builds JSON headers and body payload for POST /api/AdminSetUpAPI/AddUpdateTestimonialReview
 * 
 * @param {object} data - Testimonial review data object
 * @returns {{ headers: object, body: string }} Formatted JSON request object
 */
export function buildAddUpdateTestimonialReviewInput(data = {}) {
  const bodyData = {
    AdminId: Number(data.AdminId || data.adminId || 1),
    TestimonialReviewMasterId: Number(data.TestimonialReviewMasterId ?? data.testimonialReviewMasterId ?? 0),
    ReviewInStar: Number(data.ReviewInStar ?? data.reviewInStar ?? 5),
    ReviewDescription: String(data.ReviewDescription ?? data.reviewDescription ?? '').trim(),
    ReviewerName: String(data.ReviewerName ?? data.reviewerName ?? '').trim(),
    ReviewerDesignation: String(data.ReviewerDesignation ?? data.reviewerDesignation ?? '').trim(),
    ReviewerImagePath: String(data.ReviewerImagePath ?? data.reviewerImagePath ?? ''),
    GivenFileName: String(data.GivenFileName ?? data.givenFileName ?? ''),
    OriginalFileName: String(data.OriginalFileName ?? data.originalFileName ?? ''),
    // camelCase aliases for ASP.NET Core controllers expecting camelCase properties
    adminId: Number(data.AdminId || data.adminId || 1),
    testimonialReviewMasterId: Number(data.TestimonialReviewMasterId ?? data.testimonialReviewMasterId ?? 0),
    reviewInStar: Number(data.ReviewInStar ?? data.reviewInStar ?? 5),
    reviewDescription: String(data.ReviewDescription ?? data.reviewDescription ?? '').trim(),
    reviewerName: String(data.ReviewerName ?? data.reviewerName ?? '').trim(),
    reviewerDesignation: String(data.ReviewerDesignation ?? data.reviewerDesignation ?? '').trim(),
    reviewerImagePath: String(data.ReviewerImagePath ?? data.reviewerImagePath ?? ''),
    givenFileName: String(data.GivenFileName ?? data.givenFileName ?? ''),
    originalFileName: String(data.OriginalFileName ?? data.originalFileName ?? '')
  };

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(bodyData)
  };
}

/**
 * 3. FETCH TESTIMONIAL REVIEW LIST INPUT DTO BUILDER
 * Builds JSON headers and body payload for POST /api/AdminSetUpAPI/GetTestimonialReviewList
 * Supports calling with an options object or positional arguments.
 * 
 * @param {object|number} [optionsOrPageNo=1] - Pagination options object or pageNo number
 * @param {number} [pageSize=10] - Number of items per page
 * @param {string} [searchInput=''] - Search term
 * @param {number} [adminId=0] - Admin identifier
 * @param {string} [orderByColumn='UpdatedOn'] - Sort column
 * @param {string} [orderByDirection='DESC'] - Sort direction ('ASC'|'DESC')
 * @param {number} [totalRecords=0] - Total records count
 * @returns {{ headers: object, body: string }} Formatted JSON request object
 */
export function buildGetTestimonialReviewListInput(
  optionsOrPageNo = 1,
  pageSize = 10,
  searchInput = '',
  adminId = 1,
  orderByColumn = 'UpdatedOn',
  orderByDirection = 'DESC',
  totalRecords = 0
) {
  let finalAdminId = adminId;
  let finalPageNo = pageSize;
  let finalPageSize = pageSize;
  let finalSearchInput = searchInput;
  let finalOrderByColumn = orderByColumn;
  let finalOrderByDirection = orderByDirection;
  let finalTotalRecords = totalRecords;

  if (typeof optionsOrPageNo === 'object' && optionsOrPageNo !== null) {
    finalAdminId = Number(optionsOrPageNo.adminId || optionsOrPageNo.AdminId || 1);
    finalPageNo = Number(optionsOrPageNo.pageNo ?? optionsOrPageNo.PageNo ?? 1);
    finalPageSize = Number(optionsOrPageNo.pageSize ?? optionsOrPageNo.PageSize ?? 10);
    finalSearchInput = String(optionsOrPageNo.searchInput ?? optionsOrPageNo.SearchInput ?? optionsOrPageNo.searchText ?? '');
    finalOrderByColumn = String(optionsOrPageNo.orderByColumn ?? optionsOrPageNo.OrderByColumn ?? 'UpdatedOn');
    finalOrderByDirection = String(optionsOrPageNo.orderByDirection ?? optionsOrPageNo.OrderByDirection ?? 'DESC');
    finalTotalRecords = Number(optionsOrPageNo.totalRecords ?? optionsOrPageNo.TotalRecords ?? 0);
  } else {
    finalPageNo = Number(optionsOrPageNo || 1);
    finalPageSize = Number(pageSize || 10);
    finalSearchInput = String(searchInput || '');
    finalAdminId = Number(adminId || 1);
    finalOrderByColumn = String(orderByColumn || 'UpdatedOn');
    finalOrderByDirection = String(orderByDirection || 'DESC');
    finalTotalRecords = Number(totalRecords || 0);
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      adminId: finalAdminId,
      pageNo: finalPageNo,
      pageSize: finalPageSize,
      orderByColumn: finalOrderByColumn,
      orderByDirection: finalOrderByDirection,
      totalRecords: finalTotalRecords,
      searchInput: finalSearchInput
    })
  };
}

/**
 * 4. GET TESTIMONIAL REVIEW BY ID INPUT DTO BUILDER
 * Builds query parameters and form/JSON payload for POST /api/AdminSetUpAPI/GetTestimonialReviewById
 * 
 * @param {number} testimonialReviewById - Review identifier to fetch
 * @param {number} [adminId=0] - Optional Admin ID
 * @returns {{ queryString: string, formData: FormData, body: string, headers: object }}
 */
export function buildGetTestimonialReviewByIdInput(testimonialReviewById = 0, adminId = 1) {
  const cleanId = Number(testimonialReviewById || 0);
  const cleanAdminId = Number(adminId || 1);

  const formData = new FormData();
  formData.append('testimonialReviewById', String(cleanId));
  formData.append('TestimonialReviewById', String(cleanId));
  formData.append('adminId', String(cleanAdminId));
  formData.append('AdminId', String(cleanAdminId));

  return {
    testimonialReviewById: cleanId,
    adminId: cleanAdminId,
    queryString: `?testimonialReviewById=${cleanId}`,
    formData: formData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      testimonialReviewById: cleanId,
      adminId: cleanAdminId
    })
  };
}

/**
 * 5. DELETE TESTIMONIAL REVIEW INPUT DTO BUILDER
 * Builds JSON headers and body payload for POST /api/AdminSetUpAPI/DeleteTestimonialReview
 * 
 * @param {number} testimonialReviewMasterId - Review identifier to delete
 * @param {number} [adminId=0] - Admin identifier
 * @returns {{ headers: object, body: string }} Formatted JSON request object
 */
export function buildDeleteTestimonialReviewInput(testimonialReviewMasterId = 0, adminId = 1) {
  const cleanId = Number(testimonialReviewMasterId || 0);
  const cleanAdminId = Number(adminId || 1);

  return {
    testimonialReviewMasterId: cleanId,
    adminId: cleanAdminId,
    queryString: `?TestimonialReviewMasterId=${cleanId}&testimonialReviewMasterId=${cleanId}`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      TestimonialReviewMasterId: cleanId,
      AdminId: cleanAdminId,
      testimonialReviewMasterId: cleanId,
      adminId: cleanAdminId
    })
  };
}

// Backward compatibility alias for legacy code
export const bindTestimonialReviewInput = buildGetTestimonialReviewListInput;