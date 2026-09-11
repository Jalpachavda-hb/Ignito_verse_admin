/**
 * OUTPUT PARAMETER FILE: Authentication Response DTO Parsers
 * Parses raw HTTP response payloads from .NET Web API into clean UI data objects.
 */

/**
 * Parses Login API response payload.
 * @param {object} rawJson - Raw JSON response from backend
 * @param {number} status - HTTP status code
 * @returns {object} Standardized auth result `{ success, status, token, refreshToken, user, message, error }`
 */
export function parseLoginOutput(rawJson = {}, status = 200) {
  const isOk = status >= 200 && status < 300;

  if (!isOk) {
    return parseAuthErrorOutput(rawJson, status);
  }

  // Extract token & user info supporting various .NET API response conventions
  const token = rawJson?.token || rawJson?.accessToken || rawJson?.data?.token || rawJson?.data?.jwtToken || rawJson?.data || '';
  const refreshToken = rawJson?.refreshToken || rawJson?.data?.refreshToken || '';

  const userObj = rawJson?.user || rawJson?.data?.user || (typeof rawJson?.data === 'object' ? rawJson?.data : {}) || rawJson || {};
  const empId = userObj.empId || userObj.id || userObj.employeeId || 'EMP-1001';
  const name = userObj.name || userObj.fullName || userObj.userName || (userObj.email ? userObj.email.split('@')[0] : 'Enterprise User');
  const email = userObj.email || userObj.userName || '';
  const role = userObj.role || 'Executive Learner';
  const company = userObj.company || userObj.companyName || 'IgnitoVerse Enterprise';
  const avatar = userObj.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

  return {
    success: true,
    status,
    token: typeof token === 'string' ? token : JSON.stringify(token),
    refreshToken,
    user: {
      id: empId,
      empId,
      name,
      email,
      role,
      company,
      avatar
    },
    message: rawJson?.message || 'Login successful'
  };                       
}

/**
 * Parses Register API response payload.
 * @param {object} rawJson - Raw JSON response from backend
 * @param {number} status - HTTP status code
 */
export function parseRegisterOutput(rawJson = {}, status = 200) {
  const isOk = status >= 200 && status < 300;
  if (!isOk) {
    return parseAuthErrorOutput(rawJson, status);
  }

  return {
    success: true,
    status,
    message: rawJson?.message || 'Registration successful',
    data: rawJson?.data || rawJson
  };
}

/**
 * Parses Error API responses from backend.
 * @param {object} rawJson - Raw JSON response from backend
 * @param {number} status - HTTP status code
 */
export function parseAuthErrorOutput(rawJson = {}, status = 400) {
  let errorText = rawJson?.message || rawJson?.title || rawJson?.error || 'Authentication request failed';

  if (rawJson?.errors && typeof rawJson.errors === 'object') {
    const fieldErrors = Object.values(rawJson.errors).flat().join(', ');
    if (fieldErrors) {
      errorText = `${errorText}: ${fieldErrors}`;
    }
  }

  return {
    success: false,
    status,
    error: errorText,
    details: rawJson?.errors || null,
    token: null,
    user: null
  };
}
