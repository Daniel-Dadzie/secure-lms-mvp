import axios from "axios";

// ----------------------------------------------------------------------------
// Base axios instance — all API calls go through this.
// Centralizing here means token attachment, refresh logic, and base URL
// are configured once, not scattered across every component.
// ----------------------------------------------------------------------------
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true, // sends httpOnly refresh cookie on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------------------------------------------------------------------
// Request interceptor — attach access token from memory to every request.
// Token is never read from localStorage (security requirement).
// It comes from the Zustand auth store (in-memory only).
// ----------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  // Dynamically import to avoid circular dependency with the store
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------------------------------------------------------
// Response interceptor — on 401, attempt a silent token refresh then retry.
// If refresh fails, clear auth state and redirect to login.
// This handles the case where the access token expires mid-session without
// forcing the user to manually log in again.
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
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

        // Redirect to login if we're in the browser
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

// ----------------------------------------------------------------------------
// In-memory token storage — never localStorage or sessionStorage.
// Token lives only for the duration of this browser tab session.
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

export default api;