/**
 * AUTHENTICATION SERVICE
 * Connects Login UI with .NET Web API using Input and Output Parameter DTOs.
 * Enforces a 2-hour session expiration rule for admin security.
 */

import { apiClient } from './apiClient';
import { buildValidateAdminCredentialInput } from '../dto/input/validateAdminCredentialInput';
import {
  parseValidateAdminCredentialOutput,
  parseValidateAdminCredentialErrorOutput,
} from '../dto/output/validateAdminCredentialOutput';
import {
  saveAuthSession,
  clearAuthSession,
  isAuthenticated as checkIsAuthenticated,
  getSavedUserSession as checkSavedUserSession,
  getAdminProfile as checkAdminProfile,
  getSavedAdminId as checkSavedAdminId,
  isSessionExpired as checkSessionExpired,
  getSessionRemainingTime as checkSessionRemainingTime,
  SESSION_DURATION_MS
} from './sessionManager';

// Re-export session management utilities and constants for backward compatibility
export {
  SESSION_DURATION_MS,
  saveAuthSession,
  clearAuthSession
};

/**
 * Checks if session has passed the 2-hour timeout limit.
 * @returns {boolean}
 */
export function isSessionExpired() {
  return checkSessionExpired();
}

/**
 * Gets remaining time before session expires in milliseconds.
 * @returns {number}
 */
export function getSessionRemainingTime() {
  return checkSessionRemainingTime();
}

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

    // 3. Save session token and admin info with 2-hour session timestamp on success
    if (outputDto.success) {
      saveAuthSession({
        token: outputDto.token,
        user: outputDto.user,
        adminId: outputDto.adminId
      });
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
  clearAuthSession();
}

/**
 * Checks if admin has an active authenticated session within the 2-hour lifetime.
 * @returns {boolean} True if authenticated and session is fresh, false otherwise.
 */
export function isAuthenticated() {
  return checkIsAuthenticated();
}

/**
 * Gets currently logged in user session from localStorage if available.
 */
export function getSavedUserSession() {
  return checkSavedUserSession();
}

/**
 * Gets normalized admin profile data from saved session.
 */
export function getAdminProfile() {
  return checkAdminProfile();
}

/**
 * Gets currently logged in admin ID from localStorage.
 */
export function getSavedAdminId() {
  return checkSavedAdminId();
}
