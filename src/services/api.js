import axios from 'axios';
import { clearLegacyToken, getAdminToken, getPublicToken, setAdminToken, setPublicToken } from '../utils/auth';

const resolveApiBaseUrl = () => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || '').trim();
  if (!raw) return '';

  const normalized = raw.replace(/\/+$/, '');
  // console.log(process.env.NEXT_PUBLIC_API_URL);
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const scope = config?.meta?.scope ?? (isAdminRoute ? 'admin' : 'public');
    const token = scope === 'admin' ? getAdminToken() : getPublicToken();

    config.headers = {
      ...config.headers,
      'x-auth-scope': scope === 'admin' ? 'admin' : 'student',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    clearLegacyToken();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error?.response?.status;
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const scope = error?.config?.meta?.scope ?? (isAdminRoute ? 'admin' : 'public');

    if (typeof window !== 'undefined' && status === 401) {
      const isRefreshRequest = error?.config?.url?.includes('/auth/refresh');
      if (!isRefreshRequest && !error?.config?._retry) {
        error.config._retry = true;
        try {
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                'x-auth-scope': scope === 'admin' ? 'admin' : 'student',
              },
            }
          );

          if (scope === 'admin') {
            setAdminToken(refreshResponse?.data?.token);
          } else {
            setPublicToken(refreshResponse?.data?.token);
          }

          return api(error.config);
        } catch (refreshError) {
          if (scope === 'admin') {
            setAdminToken(null);
          } else {
            setPublicToken(null);
          }
          return Promise.reject(refreshError?.response?.data || error?.response?.data || refreshError);
        }
      }

      if (scope === 'admin') {
        setAdminToken(null);
      } else {
        setPublicToken(null);
      }
      return Promise.reject(error?.response?.data || error);
    }
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error?.response?.data || error);
  }
);

export default api;
