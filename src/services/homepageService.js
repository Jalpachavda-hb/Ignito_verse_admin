/**
 * HOMEPAGE SERVICE
 * Connects Admin Homepage UI with .NET Web API endpoints
 * using Input & Output Parameter DTOs.
 */

import { apiClient } from './apiClient';
import { buildHomeTrustedLogoListInput } from '../dto/input/homeTrustedLogoListInput';
import { parseHomeTrustedLogoListOutput, parsehomeTrustedLogoListErrorOutput } from '../dto/output/homeTrustedLogoListOutput';

// Re-export all Admin Homepage & Testimonial Review & Trusted Logo API service methods
export * from './AdminHomePageServices';
export * from './trustedByLogoService';
export * from './commonUploadService';

/**
 * Fetches trusted logos for homepage.
 * API: POST /api/HomePageAPI/HomeTrustedLogoList
 */
export async function getHomeTrustedLogoList() {
  try {
    const inputDto = buildHomeTrustedLogoListInput();
    const response = await apiClient('/HomePageAPI/HomeTrustedLogoList', {
      method: 'POST',
      isPublic: true,
      headers: inputDto.headers,
      body: inputDto.body
    });
    if (!response.ok && response.status !== 200) {
      return parsehomeTrustedLogoListErrorOutput(response.data, response.status);
    }
    return parseHomeTrustedLogoListOutput(response.data, response.status);
  } catch (error) {
    console.error('Error fetching home trusted logo list:', error);
    return parsehomeTrustedLogoListErrorOutput({ message: error.message }, 500);
  }
}

export const fetchHomeTrustedLogoList = getHomeTrustedLogoList;
