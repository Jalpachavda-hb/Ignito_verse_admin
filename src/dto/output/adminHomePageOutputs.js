/**
 * OUTPUT PARAMETER FILE: Admin Homepage Response DTO Parsers
 * Parses raw HTTP responses from .NET Web API Admin Homepage endpoints into clean UI data objects.
 */

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || '';

/**
 * Normalizes image paths or returns direct image URL.
 * If backend already provides a direct URL (http:// or https://), returns as-is.
 * 
 * @param {string} path - Image URL or relative path
 * @returns {string} Fully qualified image URL or direct path
 */
export function formatImageUrl(path) {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  // Normalize Windows backslashes and strip leading slashes or accidental /api/ prefix
  const cleanPath = path
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^api\/+/i, '');

  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || '';
  return baseUrl ? `${baseUrl.replace(/\/$/, '')}/${cleanPath}` : `/${cleanPath}`;
}

/**
 * 1. UPLOAD HOME PAGE FILES OUTPUT DTO PARSER
 * Parses response from POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {Array|object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized upload response with file list and primary file info
 */
export function parseUploadHomePageFileOutput(rawJson = [], status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const rawList = Array.isArray(rawJson)
    ? rawJson
    : (rawJson?.data || rawJson?.files || rawJson?.documents || rawJson?.documentList || [rawJson]);

  const fileList = Array.isArray(rawList)
    ? rawList.filter(Boolean).map(item => ({
        filePath: item.filePath || item.FilePath || item.path || item.Path || item.url || item.Url || (typeof item === 'string' ? item : ''),
        fileName: item.fileName || item.FileName || item.originalName || item.OriginalName || ''
      }))
    : [];

  const primaryFile = fileList[0] || { filePath: '', fileName: '' };

  return {
    success: isHttpOk && (fileList.length > 0 || !!primaryFile.filePath),
    status,
    fileList,
    filePath: primaryFile.filePath,
    fileName: primaryFile.fileName,
    fullUrl: formatImageUrl(primaryFile.filePath),
    rawData: rawJson
  };
}

export function parseUploadHomePageFileErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    status,
    message: rawJson?.message || rawJson?.Message || 'Failed to upload image file',
    errorDescription: rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || 'Network/Server Error',
    fileList: [],
    filePath: '',
    fileName: '',
    fullUrl: '',
    rawData: rawJson
  };
}

/**
 * 2. ADD / UPDATE HOME PAGE DETAILS OUTPUT DTO PARSER
 * Parses response from POST /api/HomePageAPI/HomePageDetailAddUpdate
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized result `{ success, isSuccess, message, statusCode, status, rawData }`
 */
export function parseHomePageDetailAddUpdateOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  return {
    success: isSuccess,
    isSuccess,
    message: rawJson?.message || (isSuccess ? 'Home page data saved successfully.' : 'Failed to save home page data.'),
    statusCode: rawJson?.statusCode ?? status,
    status,
    rawData: rawJson
  };
}

export function parseHomePageDetailAddUpdateErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to save home page data',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    statusCode: rawJson?.statusCode ?? status,
    status,
    rawData: rawJson
  };
}

/**
 * 3. FETCH HOME PAGE LIST OUTPUT DTO PARSER
 * Parses response from POST /api/HomePageAPI/HomePageList
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized list `{ success, isSuccess, message, totalRecords, homePageList, status, rawData }`
 */
export function parseAdminHomePageListOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  const rawList = rawJson?.homePageList || rawJson?.HomePageList || rawJson?.data || [];
  const homePageList = Array.isArray(rawList)
    ? rawList.map(item => ({
        homePageId: item.homePageId ?? item.HomePageId ?? 0,
        homeSloganTwo: item.homeSloganTwo ?? item.HomeSloganTwo ?? '',
        homeTitleTwo: item.homeTitleTwo ?? item.HomeTitleTwo ?? '',
        createdDate: item.createdDate ?? item.CreatedDate ?? '',
        ...item
      }))
    : [];

  return {
    success: isSuccess,
    isSuccess,
    message: rawJson?.message || '',
    totalRecords: Number(rawJson?.totalRecords ?? rawJson?.TotalRecords ?? homePageList.length),
    homePageList,
    status,
    rawData: rawJson
  };
}

export function parseAdminHomePageListErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to load home page list',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    totalRecords: 0,
    homePageList: [],
    status,
    rawData: rawJson
  };
}

/**
 * 4. GET HOME PAGE DETAILS BY ID OUTPUT DTO PARSER
 * Parses response from POST /api/HomePageAPI/HomePageGetById
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized details object
 */
export function parseHomePageGetByIdOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const data = rawJson?.data || rawJson;

  const rawSliders = data?.getHomePageList || data?.GetHomePageList || data?.homePageList || data?.HomePageList || [];
  const sliderList = Array.isArray(rawSliders)
    ? rawSliders.map(item => ({
        homeSlogan: item.homeSlogan ?? item.HomeSlogan ?? '',
        homeTitle: item.homeTitle ?? item.HomeTitle ?? '',
        homeBannerImage: item.homeBannerImage ?? item.HomeBannerImage ?? '',
        homeDescription: item.homeDescription ?? item.HomeDescription ?? '',
        fullBannerUrl: formatImageUrl(item.homeBannerImage ?? item.HomeBannerImage ?? '')
      }))
    : [];

  const homePageData = {
    homePageId: data?.homePageId ?? data?.HomePageId ?? 0,
    getHomePageList: sliderList,
    homePageList: sliderList,
    homeSloganTwo: data?.homeSloganTwo ?? data?.HomeSloganTwo ?? '',
    homeTitleTwo: data?.homeTitleTwo ?? data?.HomeTitleTwo ?? '',
    homeBannerImageTwo: data?.homeBannerImageTwo ?? data?.HomeBannerImageTwo ?? '',
    homeDescriptionTwo: data?.homeDescriptionTwo ?? data?.HomeDescriptionTwo ?? '',
    homeTwoIconImage: data?.homeTwoIconImage ?? data?.HomeTwoIconImage ?? '',
    homeTwoIconImageDescription: data?.homeTwoIconImageDescription ?? data?.HomeTwoIconImageDescription ?? '',
    homeTwoIconImageOne: data?.homeTwoIconImageOne ?? data?.HomeTwoIconImageOne ?? '',
    homeTwoIconImageOneDescription: data?.homeTwoIconImageOneDescription ?? data?.HomeTwoIconImageOneDescription ?? '',
    chooseUsTitle: data?.chooseUsTitle ?? data?.ChooseUsTitle ?? '',
    chooseUsDescription: data?.chooseUsDescription ?? data?.ChooseUsDescription ?? '',
    chooseUsIconImage: data?.chooseUsIconImage ?? data?.ChooseUsIconImage ?? '',
    chooseUsIconTitle: data?.chooseUsIconTitle ?? data?.ChooseUsIconTitle ?? '',
    chooseUsIconImageTwo: data?.chooseUsIconImageTwo ?? data?.ChooseUsIconImageTwo ?? '',
    chooseUsIconTitleTwo: data?.chooseUsIconTitleTwo ?? data?.ChooseUsIconTitleTwo ?? '',
    chooseUsIconImageThree: data?.chooseUsIconImageThree ?? data?.ChooseUsIconImageThree ?? '',
    chooseUsIconTitleThree: data?.chooseUsIconTitleThree ?? data?.ChooseUsIconTitleThree ?? '',
    chooseUsIconImageFour: data?.chooseUsIconImageFour ?? data?.ChooseUsIconImageFour ?? '',
    chooseUsIconTitleTwoFour: data?.chooseUsIconTitleTwoFour ?? data?.ChooseUsIconTitleTwoFour ?? '',
    chooseUsIconImageFive: data?.chooseUsIconImageFive ?? data?.ChooseUsIconImageFive ?? '',
    chooseUsIconTitleFive: data?.chooseUsIconTitleFive ?? data?.ChooseUsIconTitleFive ?? '',
    chooseUsIconImageSix: data?.chooseUsIconImageSix ?? data?.ChooseUsIconImageSix ?? '',
    chooseUsIconTitleSix: data?.chooseUsIconTitleSix ?? data?.ChooseUsIconTitleSix ?? '',
    errorDescription: data?.errorDescription ?? data?.ErrorDescription ?? ''
  };

  return {
    success: isHttpOk && Boolean(homePageData.homePageId),
    isSuccess: isHttpOk,
    homePageData,
    status,
    rawData: rawJson
  };
}

export function parseHomePageGetByIdErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to load home page details',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    homePageData: null,
    status,
    rawData: rawJson
  };
}

/**
 * 5. DELETE HOME PAGE RECORD OUTPUT DTO PARSER
 * Parses response from POST /api/HomePageAPI/HomePageDataDelete
 * 
 * @param {object} rawJson - Response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized delete response `{ success, isSuccess, message, status, rawData }`
 */
export function parseHomePageDataDeleteOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;
  const isSuccess = Boolean(rawJson?.isSuccess ?? isHttpOk);

  return {
    success: isSuccess,
    isSuccess,
    message: rawJson?.message || (isSuccess ? 'Data deleted successfully.' : 'Failed to delete data.'),
    status,
    rawData: rawJson
  };
}

export function parseHomePageDataDeleteErrorOutput(rawJson = {}, status = 500) {
  return {
    success: false,
    isSuccess: false,
    message: rawJson?.message || 'Failed to delete home page data',
    errorDescription: rawJson?.errorDescription || rawJson?.error || 'Network/Server Error',
    status,
    rawData: rawJson
  };
}
