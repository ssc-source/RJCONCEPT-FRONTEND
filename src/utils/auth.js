export const ADMIN_TOKEN_KEY = 'adminToken';
export const PUBLIC_TOKEN_KEY = 'studentToken';
export const AUTH_CHANGED_EVENT = 'rj-auth-changed';

const LEGACY_ADMIN_TOKEN_KEY = 'admin_access_token';
const LEGACY_PUBLIC_TOKEN_KEY = 'student_access_token';

export const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(LEGACY_ADMIN_TOKEN_KEY);
};

export const getPublicToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PUBLIC_TOKEN_KEY) || localStorage.getItem(LEGACY_PUBLIC_TOKEN_KEY);
};

export const setAdminToken = (token) => {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token && existing === token) return;
  if (!token && existing === null && localStorage.getItem(LEGACY_ADMIN_TOKEN_KEY) === null) return;

  if (token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
  localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { scope: 'admin' } }));
};

export const setPublicToken = (token) => {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(PUBLIC_TOKEN_KEY);
  if (token && existing === token) return;
  if (!token && existing === null && localStorage.getItem(LEGACY_PUBLIC_TOKEN_KEY) === null) return;

  if (token) {
    localStorage.setItem(PUBLIC_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(PUBLIC_TOKEN_KEY);
  }
  localStorage.removeItem(LEGACY_PUBLIC_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT, { detail: { scope: 'public' } }));
};

export const clearLegacyToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

export const clearAllAuthTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(PUBLIC_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  localStorage.removeItem(LEGACY_PUBLIC_TOKEN_KEY);
  localStorage.removeItem('token');
};

export const getScopedToken = (scope) => {
  if (scope === 'admin') return getAdminToken();
  return getPublicToken();
};
