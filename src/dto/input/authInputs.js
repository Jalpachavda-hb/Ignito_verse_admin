/**
 * INPUT PARAMETER FILE: Authentication Request DTO Builders
 * Responsible for formatting and validating input parameters for .NET Web API requests.
 */

/**
 * Builds input parameter body for Login POST request.
 * @param {string} email - User email address
 * @param {string} password - User password
 * @returns {object} Formatted input request headers and body payload
 */
export function buildLoginInput(email, password) {
  const sanitizedEmail = (email || '').trim();
  const sanitizedPassword = password || '';

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      // Supports both standard JS camelCase and .NET PascalCase conventions
      userName: sanitizedEmail,
      password: sanitizedPassword,

    })
  };
}

/**
 * Builds input parameter body for Register POST request.
 * @param {object} param0 - Registration parameters
 * @returns {object} Formatted request payload
 */
export function buildRegisterInput({ fullName, email, password, companyName = '' }) {
  const sanitizedEmail = (email || '').trim();
  const sanitizedName = (fullName || '').trim();

  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      fullName: sanitizedName,
      FullName: sanitizedName,
      email: sanitizedEmail,
      Email: sanitizedEmail,
      password: password || '',
      Password: password || '',
      companyName: companyName,
      CompanyName: companyName
    })
  };
}

/**
 * Builds input parameter body for Token Refresh POST request.
 * @param {string} token - Current JWT Token
 * @param {string} refreshToken - Refresh Token string
 */
export function buildRefreshTokenInput(token, refreshToken) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      token,
      Token: token,
      refreshToken,
      RefreshToken: refreshToken
    })
  };
}
