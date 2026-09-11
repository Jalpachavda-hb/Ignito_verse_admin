/**
 * INPUT PARAMETER FILE: Validate Admin Credential Input DTO Builder
 * Builds input parameter body for ValidateAdminCredential POST request.
 * Endpoint: POST /api/AdminAuthenticationAPI/ValidateAdminCredential
 * 
 * @param {string} emailOrUsername - Admin email or username
 * @param {string} password - Admin password
 * @returns {object} Formatted request headers and JSON stringified body payload
 */
export function buildValidateAdminCredentialInput(emailOrUsername = '', password = '') {
  const sanitizedUser = (emailOrUsername || '').trim();
  const sanitizedPassword = password || '';

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      email: sanitizedUser,
      Email: sanitizedUser,
      userName: sanitizedUser,
      UserName: sanitizedUser,
      adminEmail: sanitizedUser,
      AdminEmail: sanitizedUser,
      adminUserName: sanitizedUser,
      AdminUserName: sanitizedUser,
      password: sanitizedPassword,
      Password: sanitizedPassword,
      adminPassword: sanitizedPassword,
      AdminPassword: sanitizedPassword
    })
  };
}
