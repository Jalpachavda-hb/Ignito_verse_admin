/**
 * AUTHENTICATION SERVICE
 * Connects Login UI with .NET Web API using Input and Output Parameter DTOs.
 */

import { apiClient } from './apiClient';
import { buildValidateAdminCredentialInput } from '../dto/input/validateAdminCredentialInput';
import {
  parseValidateAdminCredentialOutput,
  parseValidateAdminCredentialErrorOutput,
} from '../dto/output/validateAdminCredentialOutput';

const STORAGE_TOKEN_KEY = 'ignito_auth_token';
const STORAGE_USER_KEY = 'ignito_auth_user';
const STORAGE_ADMIN_ID_KEY = 'ignito_admin_id';

/**
 * Authenticates admin against .NET Web API (ValidateAdminCredential).
 * Endpoint: POST /api/AdminAuthenticationAPI/ValidateAdminCredential
 * 
 * @param {string} emailOrUsername - Admin email or username
 * @param {string} password - Admin password
 * @returns {Promise<object>} Parsed Output Parameter Object `{ success, user, token, adminId, message, error }`
 */
export async function validateAdminCredential(emailOrUsername, password) {
  try {
    // 1. Prepare Input Parameter DTO
    const inputDto = buildValidateAdminCredentialInput(emailOrUsername, password);

    // 2. Send Request to .NET Endpoint
    const response = await apiClient('api/AdminAuthenticationAPI/ValidateAdminCredential', {
      method: 'POST',
      headers: inputDto.headers,
      body: inputDto.body,
      isPublic: true
    });

    if (!response.ok && response.status !== 200) {
      return parseValidateAdminCredentialErrorOutput(response.data, response.status);
    }

    const outputDto = parseValidateAdminCredentialOutput(response.data, response.status);

    // 3. Save session token and admin info on success
    if (outputDto.success) {
      if (outputDto.token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, outputDto.token);
      }
      if (outputDto.user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(outputDto.user));
      }
      if (outputDto.adminId) {
        localStorage.setItem(STORAGE_ADMIN_ID_KEY, String(outputDto.adminId));
      }
    }

    return outputDto;
  } catch (error) {
    console.error('Error in validateAdminCredential:', error);
    return parseValidateAdminCredentialErrorOutput({ message: error.message }, 500);
  }
}

/**
 * Backward compatibility alias for login
 */
export async function loginUser(email, password) {
  return validateAdminCredential(email, password);
}

/**
 * Logs out user and clears local session.
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem(STORAGE_ADMIN_ID_KEY);
}

/**
 * Checks if admin has an active authenticated session.
 * @returns {boolean} True if authenticated, false otherwise.
 */
export function isAuthenticated() {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const user = localStorage.getItem(STORAGE_USER_KEY);
    return Boolean(token || user);
  } catch {
    return false;
  }
}

/**
 * Gets currently logged in user session from localStorage if available.
 */
export function getSavedUserSession() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Gets normalized admin profile data from saved session.
 */
export function getAdminProfile() {
  const user = getSavedUserSession();
  const firstName = user?.firstName || (user?.fullName ? user.fullName.split(' ')[0] : 'Admin');
  const lastName = user?.lastName || (user?.fullName && user.fullName.split(' ').length > 1 ? user.fullName.split(' ').slice(1).join(' ') : '');
  return {
    adminId: user?.adminId || user?.id || 1,
    firstName: firstName || 'Admin',
    lastName: lastName || '',
    fullName: user?.fullName || `${firstName} ${lastName}`.trim() || 'Admin User',
    emailId: user?.emailId || user?.email || 'admin@ignitoverse.com',
    mobileNumber: user?.mobileNumber || '',
    profileImage: user?.profileImage || user?.avatar || '',
    adminRoleName: user?.adminRoleName || user?.role || 'Administrator',
    dashboardPath: user?.dashboardPath || '/',
    adminDashboardId: user?.adminDashboardId || 1,
    adminPermissionsList: user?.adminPermissionsList || []
  };
}

/**
 * Gets currently logged in admin ID from localStorage.
 */
export function getSavedAdminId() {
  try {
    const adminId = localStorage.getItem(STORAGE_ADMIN_ID_KEY);
    return adminId ? Number(adminId) : 1;
  } catch {
    return 1;
  }
}
