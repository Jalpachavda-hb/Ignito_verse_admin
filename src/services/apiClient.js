/**
 * Centralized API Client for making HTTP requests to .NET Web API.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Custom fetch wrapper for API communication.
 * 
 * @param {string} endpoint - API path (e.g. '/AdminAuthenticationAPI/ValidateAdminCredential')
 * @param {RequestInit} [options={}] - Standard fetch options (method, headers, body)
 * @returns {Promise<{ data: any, status: number, statusText: string, ok: boolean, headers: Headers }>}
 */
export async function apiClient(endpoint, options = {}) {
  const cleanEndpoint = endpoint.replace(/^\/?api\//i, '').replace(/^\//, '');
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${BASE_URL.replace(/\/$/, '')}/${cleanEndpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  // If request body is FormData, browser must set Content-Type header with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  // Only attach token if endpoint is not explicitly marked public and header not disabled
  const isExplicitPublic = options.isPublic === true || options.requiresAuth === false;
  if (!isExplicitPublic && !headers['Authorization']) {
    const token = localStorage.getItem('ignito_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Remove Authorization if explicitly set to null/false/empty
  if (headers['Authorization'] === null || headers['Authorization'] === false || headers['Authorization'] === '') {
    delete headers['Authorization'];
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data = null;
    const contentType = res.headers.get('content-type');
    if (options.responseType === 'blob' || (contentType && (contentType.includes('spreadsheetml') || contentType.includes('octet-stream') || contentType.includes('application/vnd')))) {
      data = await res.blob();
    } else if (contentType && contentType.includes('json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // Auto-clean stale token if 401 occurs on protected endpoint
    if (res.status === 401) {
      localStorage.removeItem('ignito_auth_token');
    }

    return {
      data,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      headers: res.headers,
    };
  } catch (error) {
    console.error('API Client Network Error:', error);
    return {
      data: null,
      status: 0,
      statusText: error.message || 'Network Error',
      ok: false,
      error,
    };
  }
}
