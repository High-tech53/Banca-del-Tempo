import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // include cookies for refresh token
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retry && original.url !== '/auth/refresh' && original.url !== '/auth/login') {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post('/api/auth/refresh', null, { withCredentials: true })
            .then((res) => {
              const newToken = (res.data as { accessToken: string }).accessToken;
              useAuthStore.getState().setAccessToken(newToken);
              return newToken;
            })
            .finally(() => { refreshing = null; });
        }
        const newToken = await refreshing;
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api.request(original);
      } catch {
        useAuthStore.getState().clear();
      }
    }
    return Promise.reject(error);
  }
);
