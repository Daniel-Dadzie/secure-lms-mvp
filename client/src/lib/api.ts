import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

// ----------------------------------------------------------------------------
// Base axios instance
// ----------------------------------------------------------------------------
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true, // Required to send the httpOnly cookie during /auth/refresh
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------------------------------------------------------
// Secure In-Memory Token Storage
// Tokens live only in this file's closure, protecting them from XSS.
// ----------------------------------------------------------------------------
let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string): void {
  _accessToken = token;
}

export function clearAccessToken(): void {
  _accessToken = null;
}

// ----------------------------------------------------------------------------
// Request Interceptor
// ----------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Strip Content-Type for file uploads (avatars, thumbnails, videos)
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  
  return config;
});

// ----------------------------------------------------------------------------
// Response Interceptor — Silent Refresh & Request Queuing
// ----------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    // If 401, not a retry, and not an auth endpoint, attempt silent refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post("/auth/refresh");
        const newToken = response.data.accessToken;

        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();

        try {
          useAuthStore.getState().clearAuth();
        } catch {}

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;