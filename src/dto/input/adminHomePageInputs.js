/**
 * INPUT PARAMETER FILE: Admin Homepage Request DTO Builders
 * Constructs input parameters and FormData/JSON payloads for .NET Web API Admin Homepage endpoints.
 */

/**
 * 1. UPLOAD HOME PAGE FILES INPUT DTO BUILDER
 * Builds multipart/form-data body for POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {File|Blob|FormData} file - Binary image file (.jpg, .jpeg, .png)
 * @param {string} [uploadSource='HomeBannerImage'] - "HomeBannerImage" | "HomeIconImage" | "ChooseUsIconImage"
 * @param {string} [oldPath=''] - Old file path to be replaced (e.g. "/UploadedFiles/OldImage.jpg")
 * @returns {{ headers: object, body: FormData }} Formatted multipart request object
 */
export function buildUploadHomePageFileInput(file, uploadSource = 'HomeBannerImage', oldPath = '') {
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

  if (uploadSource) {
    formData.append('source', uploadSource);
    formData.append('UploadSource', uploadSource);
    formData.append('uploadSource', uploadSource);
    formData.append('Source', uploadSource);
  }

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
 * 2. ADD / UPDATE HOME PAGE DETAILS INPUT DTO BUILDER
 * Builds JSON headers and body payload for POST /api/HomePageAPI/HomePageDetailAddUpdate
 * 
 * @param {object} payload - Home page configuration object
 * @returns {{ headers: object, body: string }} Formatted JSON request object
 */
export function buildHomePageDetailAddUpdateInput(payload = {}) {
  // Normalize slider list
  const rawList = payload.HomePageList || payload.homePageList || payload.getHomePageList || [];
  const homePageList = Array.isArray(rawList)
    ? rawList.map(item => ({
        HomeSlogan: item.HomeSlogan ?? item.homeSlogan ?? '',
        HomeTitle: item.HomeTitle ?? item.homeTitle ?? '',
        HomeBannerImage: item.HomeBannerImage ?? item.homeBannerImage ?? '',
        HomeDescription: item.HomeDescription ?? item.homeDescription ?? ''
      }))
    : [];

  const bodyData = {
    AdminId: Number(payload.AdminId || payload.adminId || 1),
    adminId: Number(payload.AdminId || payload.adminId || 1),
    HomePageId: Number(payload.HomePageId ?? payload.homePageId ?? 0),
    HomePageList: homePageList,
    HomeSloganTwo: payload.HomeSloganTwo ?? payload.homeSloganTwo ?? '',
    HomeTitleTwo: payload.HomeTitleTwo ?? payload.homeTitleTwo ?? '',
    HomeBannerImageTwo: payload.HomeBannerImageTwo ?? payload.homeBannerImageTwo ?? '',
    HomeDescriptionTwo: payload.HomeDescriptionTwo ?? payload.homeDescriptionTwo ?? '',
    HomeTwoIconImage: payload.HomeTwoIconImage ?? payload.homeTwoIconImage ?? '',
    HomeTwoIconImageDescription: payload.HomeTwoIconImageDescription ?? payload.homeTwoIconImageDescription ?? '',
    HomeTwoIconImageOne: payload.HomeTwoIconImageOne ?? payload.homeTwoIconImageOne ?? '',
    HomeTwoIconImageOneDescription: payload.HomeTwoIconImageOneDescription ?? payload.homeTwoIconImageOneDescription ?? '',
    ChooseUsTitle: payload.ChooseUsTitle ?? payload.chooseUsTitle ?? '',
    ChooseUsDescription: payload.ChooseUsDescription ?? payload.chooseUsDescription ?? '',
    ChooseUsIconImage: payload.ChooseUsIconImage ?? payload.chooseUsIconImage ?? '',
    ChooseUsIconTitle: payload.ChooseUsIconTitle ?? payload.chooseUsIconTitle ?? '',
    ChooseUsIconImageTwo: payload.ChooseUsIconImageTwo ?? payload.chooseUsIconImageTwo ?? '',
    ChooseUsIconTitleTwo: payload.ChooseUsIconTitleTwo ?? payload.chooseUsIconTitleTwo ?? '',
    ChooseUsIconImageThree: payload.ChooseUsIconImageThree ?? payload.chooseUsIconImageThree ?? '',
    ChooseUsIconTitleThree: payload.ChooseUsIconTitleThree ?? payload.chooseUsIconTitleThree ?? '',
    ChooseUsIconImageFour: payload.ChooseUsIconImageFour ?? payload.chooseUsIconImageFour ?? '',
    ChooseUsIconTitleTwoFour: payload.ChooseUsIconTitleTwoFour ?? payload.chooseUsIconTitleTwoFour ?? '',
    ChooseUsIconImageFive: payload.ChooseUsIconImageFive ?? payload.chooseUsIconImageFive ?? '',
    ChooseUsIconTitleFive: payload.ChooseUsIconTitleFive ?? payload.chooseUsIconTitleFive ?? '',
    ChooseUsIconImageSix: payload.ChooseUsIconImageSix ?? payload.chooseUsIconImageSix ?? '',
    ChooseUsIconTitleSix: payload.ChooseUsIconTitleSix ?? payload.chooseUsIconTitleSix ?? '',
    ErrorDescription: payload.ErrorDescription ?? payload.errorDescription ?? ''
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
 * 3. FETCH HOME PAGE LIST INPUT DTO BUILDER
 * Builds JSON headers and body payload for POST /api/HomePageAPI/HomePageList
 * Supports calling with an object or individual arguments.
 * 
 * @param {object|number} [optionsOrPageNo=1] - Pagination options object or pageNo number
 * @param {number} [pageSize=10] - Page size
 * @param {string} [searchText=''] - Search filter text
 * @param {number} [adminId=0] - Admin identifier
 * @returns {{ headers: object, body: string }} Formatted JSON request object
 */
export function buildAdminHomePageListInput(
  optionsOrPageNo = 1,
  pageSize = 10,
  searchText = '',
  adminId = 1
) {
  let finalAdminId = adminId;
  let finalPageNo = pageSize;
  let finalPageSize = pageSize;
  let finalSearchText = searchText;

  if (typeof optionsOrPageNo === 'object' && optionsOrPageNo !== null) {
    finalAdminId = Number(optionsOrPageNo.adminId || optionsOrPageNo.AdminId || 1);
    finalPageNo = Number(optionsOrPageNo.pageNo ?? optionsOrPageNo.PageNo ?? 1);
    finalPageSize = Number(optionsOrPageNo.pageSize ?? optionsOrPageNo.PageSize ?? 10);
    finalSearchText = String(optionsOrPageNo.searchText ?? optionsOrPageNo.SearchText ?? '');
  } else {
    finalPageNo = Number(optionsOrPageNo || 1);
    finalPageSize = Number(pageSize || 10);
    finalSearchText = String(searchText || '');
    finalAdminId = Number(adminId || 1);
  }

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      AdminId: finalAdminId,
      PageNo: finalPageNo,
      PageSize: finalPageSize,
      SearchText: finalSearchText
    })
  };
}

/**
 * 4. GET HOME PAGE DETAILS BY ID INPUT DTO BUILDER
 * Builds query parameters and form/JSON payload for POST /api/HomePageAPI/HomePageGetById
 * 
 * @param {number} homePageId - Home page record identifier
 * @param {number} [adminId=0] - Admin identifier
 * @returns {{ queryString: string, formData: FormData, body: string, headers: object }}
 */
export function buildHomePageGetByIdInput(homePageId = 0, adminId = 1) {
  const cleanHomePageId = Number(homePageId || 0);
  const cleanAdminId = Number(adminId || 1);

  const formData = new FormData();
  formData.append('HomePageId', String(cleanHomePageId));
  formData.append('AdminId', String(cleanAdminId));

  return {
    homePageId: cleanHomePageId,
    adminId: cleanAdminId,
    queryString: `?HomePageId=${cleanHomePageId}&AdminId=${cleanAdminId}`,
    formData: formData,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      HomePageId: cleanHomePageId,
      AdminId: cleanAdminId
    })
  };
}

/**
 * 5. DELETE HOME PAGE RECORD INPUT DTO BUILDER
 * Builds JSON headers and body payload for POST /api/HomePageAPI/HomePageDataDelete
 * 
 * @param {number} homePageId - Home page record identifier to delete
 * @param {number} [adminId=0] - Admin identifier
 * @returns {{ headers: object, body: string }} Formatted JSON request object
 */
export function buildHomePageDataDeleteInput(homePageId = 0, adminId = 1) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      HomePageId: Number(homePageId || 0),
      AdminId: Number(adminId || 1)
    })
  };
}
