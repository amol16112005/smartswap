import { apiUrl } from '../config';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem('smartswap_auth');
}

export async function apiFetch(path, { method = 'GET', body, token, signal } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(apiUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    clearStoredAuth();
    throw new ApiError('Session expired. Please log in again.', response.status);
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    if (isJson) {
      const parsed = await response.json().catch(() => ({}));
      if (parsed?.error) {
        message = typeof parsed.error === 'string' ? parsed.error : parsed.error.message || message;
      }
    } else {
      const text = await response.text().catch(() => '');
      if (/high demand|503|UNAVAILABLE/i.test(text)) {
        message = 'The AI engine is experiencing high demand. Please try again shortly.';
      }
    }
    throw new ApiError(message, response.status);
  }

  if (!isJson) {
    const text = await response.text().catch(() => '');
    throw new ApiError(
      `Expected JSON but received ${contentType || 'unknown'}: ${text.substring(0, 100)}`,
      response.status,
    );
  }

  return {
    data: await response.json(),
    headers: response.headers,
  };
}