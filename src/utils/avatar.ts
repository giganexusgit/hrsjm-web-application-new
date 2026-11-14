/**
 * Utility functions for validating, normalizing, and rendering avatar and profile photo URLs.
 */

export function isValidAvatarUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === '/' ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === '/null' ||
    trimmed === '/undefined'
  ) {
    return false;
  }

  // Disallow mobile device local paths and provider schemes that cannot load on the web
  if (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('ph://') ||
    trimmed.startsWith('blob:null') ||
    trimmed.startsWith('[object') ||
    trimmed.includes('undefined') ||
    trimmed.includes('null')
  ) {
    return false;
  }

  // Allow valid web protocols, data URLs, blobs, and server relative paths
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('uploads/')
  ) {
    return true;
  }

  // Relative path with image extension
  if (trimmed.startsWith('/') && /\.(jpg|jpeg|png|webp|svg|gif|avif)(\?.*)?$/i.test(trimmed)) {
    return true;
  }

  return false;
}

export function getValidAvatarUrl(url?: string | null): string | null {
  if (!isValidAvatarUrl(url)) return null;
  const trimmed = (url as string).trim();

  // Normalize relative uploads path
  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

export function getInitials(name?: string, fallback = 'U'): string {
  if (!name) return fallback;
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) {
    const single = parts[0];
    return single.length > 0 ? single[0].toUpperCase() : fallback;
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
