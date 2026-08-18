import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// -----------------------------------------------------------------------------
// In-memory access token
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// SINGLE-FLIGHT REFRESH
//
// Only ONE refresh request can run at a time.
// All other callers wait for the same promise.
//
// This is critical because the backend rotates refresh tokens.
// -----------------------------------------------------------------------------
let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    console.log("[AUTH] Waiting for existing refresh request");
    return refreshPromise;
  }

  console.log("[AUTH] Starting refresh request");

  refreshPromise = axios
    .post(
      `${process.env.NEXT_PUBLIC_API_URL || "/api"}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      const newToken = response.data.accessToken;

      if (!newToken) {
        throw new Error("Refresh response did not contain an access token");
      }

      setAccessToken(newToken);

      console.log("[AUTH] Refresh successful");

      return newToken;
    })
    .catch((error) => {
      clearAccessToken();
      console.warn("[AUTH] Refresh failed");
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// -----------------------------------------------------------------------------
// REQUEST INTERCEPTOR
// -----------------------------------------------------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -----------------------------------------------------------------------------
// RESPONSE INTERCEPTOR
//
// A 401 triggers the shared single-flight refresh.
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";

    const isAuthEndpoint =
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/logout");

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      console.log("[AUTH] 401 received; refreshing session");

      const newToken = await refreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      console.log("[AUTH] Retrying original request");

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      console.warn("[AUTH] Session refresh failed");

      return Promise.reject(refreshError);
    }
  }
);

export default api;
