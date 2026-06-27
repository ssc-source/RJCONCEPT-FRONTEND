const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
export const DEFAULT_IMAGE_URL = '/default-avatar.svg';

export const resolveMediaUrl = (path) => {
  if (!path || typeof path !== 'string') {
    return DEFAULT_IMAGE_URL;
  }

  const trimmed = path.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return DEFAULT_IMAGE_URL;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (!BASE_URL) {
    return normalizedPath;
  }
  return `${BASE_URL}${normalizedPath}`;
};

export const handleMediaError = (event) => {
  if (event.currentTarget.src.endsWith(DEFAULT_IMAGE_URL)) {
    return;
  }
  event.currentTarget.src = DEFAULT_IMAGE_URL;
};
