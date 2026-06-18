const configured = import.meta.env.VITE_API_URL;

export const API_BASE =
  configured !== undefined && configured !== ''
    ? configured.replace(/\/$/, '')
    : import.meta.env.PROD
      ? ''
      : 'http://localhost:5000';

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}