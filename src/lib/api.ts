/**
 * API base URL for production (api.opticgallery.am).
 * Empty string = same origin (dev with proxy).
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Full URL for an API path (e.g. /api/optics -> https://api.opticgallery.am/api/optics)
 */
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}${p}` : p;
}

/**
 * Resolve image URL - prepend API base for relative paths when cross-origin
 */
export function imageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_BASE) return `${API_BASE.replace(/\/$/, '')}${url}`;
  return url;
}
