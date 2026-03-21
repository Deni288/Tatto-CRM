import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // send httpOnly refresh token cookie on every request
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Queue of requests waiting for a token refresh to complete
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token!);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error);

        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;

        // Only intercept 401s, and never retry auth endpoints
        const isAuthEndpoint = ['/auth/refresh', '/auth/login', '/auth/register'].some(
            (path) => originalRequest.url?.includes(path)
        );
        if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Another refresh is in flight — queue this request
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                if (originalRequest.headers) {
                    (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
                }
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await api.post<{ token: string }>('/auth/refresh');
            const newToken = data.token;

            useAuthStore.getState().setToken(newToken);
            processQueue(null, newToken);

            if (originalRequest.headers) {
                (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);
