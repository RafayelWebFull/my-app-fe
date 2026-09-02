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

/** Ask the API image pipeline for a right-sized WebP variant. */
export function optimizedImageUrl(url: string | null | undefined, width: number): string | null {
  const resolved = imageUrl(url);
  if (!resolved || !resolved.includes('/uploads/')) return resolved;
  const uploadPath = new URL(resolved, window.location.origin).pathname;
  return apiUrl(`/api/image?src=${encodeURIComponent(uploadPath)}&w=${Math.round(width)}`);
}
