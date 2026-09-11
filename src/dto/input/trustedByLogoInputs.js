/**
 * INPUT PARAMETER FILE: Trusted By Logo Request DTO Builders
 * Constructs payloads for the 6 Trusted By Logo module endpoints.
 */

/**
 * 1. UPLOAD TRUSTED BY LOGO IMAGES INPUT DTO BUILDER
 * Endpoint: POST /api/AdminCommonAPI/CommonUploadFile
 * 
 * @param {File|File[]|FileList} files - One or multiple binary image files (.png, .jpg, .jpeg, .svg)
 * @param {string} [oldPath=''] - Existing file path if replacing
 * @returns {{ headers: object, body: FormData }}
 */
export function buildUploadTrustedByLogoInput(files, oldPath = '') {
  if (files instanceof FormData) {
    return { headers: {}, body: files };
  }

  const formData = new FormData();

  const file = files instanceof FileList || Array.isArray(files)
    ? files[0]
    : files;

  if (file) {
    formData.append('File', file);
  }

  formData.append('UploadSource', 'TrustedByLogoMaltiImages');
  formData.append('uploadSource', 'TrustedByLogoMaltiImages');
  formData.append('source', 'TrustedByLogoMaltiImages');
  formData.append('Source', 'TrustedByLogoMaltiImages');

  if (oldPath) {
    formData.append('OldPath', oldPath);
    formData.append('oldPath', oldPath);
  }

  return {
    headers: {},
    body: formData,
  };
}

/**
 * 2. ADD / UPDATE TRUSTED BY LOGO INPUT DTO BUILDER
 * Endpoint: POST /api/HomePageAPI/TrustedByLogoAddUpdate
 * 
 * @param {object} payload
 * @param {number} [payload.adminId=0]
 * @param {number} [payload.trustedByLogoId=0]
 * @param {Array} [payload.documents=[]]
 * @returns {{ headers: object, body: string }}
 */
export function buildTrustedByLogoAddUpdateInput(payload = {}) {
  const adminId = Number(payload.AdminId || payload.adminId || 1);
  const trustedByLogoId = Number(payload.TrustedByLogoId ?? payload.trustedByLogoId ?? 0);
  const rawDocs = payload.Documents ?? payload.documents ?? [];

  const documents = Array.isArray(rawDocs)
    ? rawDocs.map((doc) => ({
        primarySource: doc.primarySource || 'TrustedByLogoMaltiImages',
        secondarySouce: doc.secondarySouce || doc.secondarySource || '',
        documentType: doc.documentType || 'TrustedByLogoMaltiImages',
        originalName: doc.originalName || doc.fileName || doc.name || '',
        givenName: doc.givenName || doc.fileName || '',
        filePath: doc.filePath || doc.path || '',
        extension: doc.extension || doc.fileExtension || '',
      }))
    : [];

  const bodyData = {
    AdminId: adminId,
    TrustedByLogoId: trustedByLogoId,
    Documents: documents,
  };

  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(bodyData),
  };
}

/**
 * 3. FETCH TRUSTED BY LOGO LIST INPUT DTO BUILDER
 * Endpoint: POST /api/HomePageAPI/TrustedByLogoList
 * 
 * @param {object} [options={}]
 * @returns {{ headers: object, body: string }}
 */
export function buildTrustedByLogoListInput(options = {}) {
  const bodyData = {
    adminId: Number(options.adminId || options.AdminId || 1),
    AdminId: Number(options.adminId || options.AdminId || 1),
    pageNo: Number(options.pageNo ?? options.PageNo ?? 1),
    pageSize: Number(options.pageSize ?? options.PageSize ?? 10),
    orderByColumn: String(options.orderByColumn ?? options.OrderByColumn ?? 'UpdatedOn'),
    orderByDirection: String(options.orderByDirection ?? options.OrderByDirection ?? 'DESC'),
    totalRecords: Number(options.totalRecords ?? options.TotalRecords ?? 0),
    searchInput: String(options.searchInput ?? options.SearchInput ?? ''),
  };

  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(bodyData),
  };
}

/**
 * 4. GET TRUSTED BY LOGO IMAGES INPUT DTO BUILDER
 * Endpoint: POST /api/HomePageAPI/GetTrustedByLogoImages
 * 
 * @param {number} trustedByLogoId
 * @returns {{ headers: object, body: string }}
 */
export function buildGetTrustedByLogoImagesInput(trustedByLogoId) {
  const id = Number(trustedByLogoId || 0);

  return {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      TrustedByLogoId: id,
      trustedByLogoId: id,
    }),
  };
}

/**
 * 5. GET TRUSTED BY LOGO BY ID INPUT DTO BUILDER
 * Endpoint: POST /api/HomePageAPI/GetTrustedByLogoGetById
 * 
 * @param {number} trustedByLogoId
 * @returns {{ queryString: string, formData: FormData, jsonBody: string }}
 */
export function buildGetTrustedByLogoGetByIdInput(trustedByLogoId) {
  const id = Number(trustedByLogoId || 0);
  const formData = new FormData();
  formData.append('TrustedByLogoId', String(id));

  return {
    queryString: `?TrustedByLogoId=${id}`,
    formData,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    jsonBody: JSON.stringify({
      TrustedByLogoId: id,
      trustedByLogoId: id,
    }),
  };
}

/**
 * 6. DELETE TRUSTED BY LOGO INPUT DTO BUILDER
 * Endpoint: POST /api/HomePageAPI/TrustedByLogoDelete
 * 
 * @param {number} trustedByLogoId
 * @param {number} [adminId=0]
 * @returns {{ headers: object, body: string, queryString: string }}
 */
export function buildTrustedByLogoDeleteInput(trustedByLogoId, adminId = 1) {
  const id = Number(trustedByLogoId || 0);
  const aId = Number(adminId || 1);

  return {
    queryString: `?TrustedByLogoId=${id}&AdminId=${aId}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      TrustedByLogoId: id,
      AdminId: aId,
      trustedByLogoId: id,
      adminId: aId,
    }),
  };
}
