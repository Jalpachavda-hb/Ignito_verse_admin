/**
 * OUTPUT PARAMETER FILE: Validate Admin Credential Output DTO Parser
 * Parses response data for ValidateAdminCredential POST request.
 * Endpoint: POST /api/AdminAuthenticationAPI/ValidateAdminCredential
 * 
 * @param {object} rawJson - Raw JSON response from API
 * @param {number} status - HTTP status code
 * @returns {object} Formatted output DTO with success, token, user, adminId, message
 */
export function parseValidateAdminCredentialOutput(rawJson = {}, status = 200) {
  const isHttpOk = status >= 200 && status < 300;

  // Check backend explicit success flags
  const explicitSuccess = rawJson?.isSuccess ?? rawJson?.IsSuccess ?? rawJson?.success ?? rawJson?.Success;
  const isSuccess = explicitSuccess !== undefined ? Boolean(explicitSuccess) && isHttpOk : isHttpOk;

  const message = rawJson?.message || rawJson?.Message || (isSuccess ? 'Login successful' : 'Invalid administrator credentials');
  const errorDescription = rawJson?.errorDescription || rawJson?.ErrorDescription || rawJson?.error || (!isSuccess ? message : '');

  // Extract admin & token data
  const dataObj = rawJson?.data || rawJson?.Data || rawJson?.admin || rawJson?.Admin || rawJson?.user || rawJson?.User || rawJson;

  const token = rawJson?.token || rawJson?.Token || rawJson?.accessToken || rawJson?.AccessToken || rawJson?.jwtToken || rawJson?.JwtToken || dataObj?.token || dataObj?.Token || dataObj?.jwtToken || '';

  const adminId = dataObj?.adminId ?? dataObj?.AdminId ?? dataObj?.id ?? dataObj?.Id ?? rawJson?.adminId ?? rawJson?.AdminId ?? 1;
  const firstName = rawJson?.firstName || dataObj?.firstName || '';
  const lastName = rawJson?.lastName || dataObj?.lastName || '';
  const adminName = (firstName && lastName)
    ? `${firstName} ${lastName}`.trim()
    : (firstName || lastName || dataObj?.adminName || dataObj?.AdminName || dataObj?.fullName || dataObj?.FullName || dataObj?.name || dataObj?.Name || dataObj?.userName || dataObj?.UserName || 'Admin User');

  const emailId = rawJson?.emailId || dataObj?.emailId || rawJson?.email || dataObj?.email || dataObj?.userName || dataObj?.UserName || '';
  const mobileNumber = rawJson?.mobileNumber || dataObj?.mobileNumber || '';
  const profileImage = rawJson?.profileImage || dataObj?.profileImage || '';
  const adminRoleName = rawJson?.adminRoleName || dataObj?.adminRoleName || dataObj?.role || dataObj?.Role || 'Administrator';
  const avatar = profileImage || dataObj?.avatar || dataObj?.Avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
  const dashboardPath = rawJson?.dashboardPath || dataObj?.dashboardPath || '';
  const adminDashboardId = rawJson?.adminDashboardId ?? dataObj?.adminDashboardId ?? 0;
  const adminPermissionsList = rawJson?.adminPermissionsList || dataObj?.adminPermissionsList || [];

  return {
    success: isSuccess,
    status,
    message,
    error: !isSuccess ? (errorDescription || message) : '',
    errorDescription,
    token: typeof token === 'string' ? token : JSON.stringify(token),
    adminId: Number(adminId) || 1,
    adminName,
    firstName,
    lastName,
    emailId,
    mobileNumber,
    profileImage,
    adminRoleName,
    dashboardPath,
    adminDashboardId,
    adminPermissionsList,
    user: {
      adminId: Number(adminId) || 1,
      id: Number(adminId) || 1,
      firstName,
      lastName,
      name: adminName,
      fullName: adminName,
      email: emailId,
      emailId,
      mobileNumber,
      profileImage,
      avatar,
      role: adminRoleName,
      adminRoleName,
      dashboardPath,
      adminDashboardId,
      adminPermissionsList
    },
    rawData: rawJson
  };
}

/**
 * Parses Error responses from ValidateAdminCredential
 * @param {object} rawJson - Error JSON
 * @param {number} status - HTTP status code
 */
export function parseValidateAdminCredentialErrorOutput(rawJson = {}, status = 400) {
  let errorText = rawJson?.message || rawJson?.Message || rawJson?.title || rawJson?.error || 'Authentication request failed';

  if (rawJson?.errors && typeof rawJson.errors === 'object') {
    const fieldErrors = Object.values(rawJson.errors).flat().join(', ');
    if (fieldErrors) {
      errorText = `${errorText}: ${fieldErrors}`;
    }
  }

  return {
    success: false,
    status,
    message: errorText,
    error: errorText,
    errorDescription: errorText,
    token: '',
    adminId: 0,
    user: null,
    rawData: rawJson
  };
}
