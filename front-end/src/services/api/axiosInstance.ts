import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Tokenservice from "./Tokenservice";
import { API_PATH } from "./Apipath";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Tokenservice.getLocalAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalConfig = error.config as CustomAxiosRequestConfig;

    if (
      originalConfig &&
      originalConfig.headers &&
      originalConfig.headers["X-Skip-Interceptor"]
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalConfig._retry) {
      console.log("[Axios] 401 detected, attempting refresh...");

      if (isRefreshing) {
        console.log("[Axios] Refresh already in progress, queuing request");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalConfig.headers) {
              originalConfig.headers["Authorization"] = `Bearer ${token}`;
            }
            return axiosInstance(originalConfig);
          })
          .catch((err) => Promise.reject(err));
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        console.log("[Axios] Calling refresh endpoint...");
        // We must use a generic axios instance or the same instance but ensure we don't loop.
        // Since the refresh endpoint is properly excluded or we can rely on path check,
        // strictly using 'withCredentials: true' is key.
        // IMPORTANT: The path to refresh token must match the backend.
        const response = await axios.post(
          `${URL}${API_PATH.AUTH.REFRESH_TOKEN}`,
          {},
          {
            withCredentials: true,
          },
        );

        console.log("[Axios] Refresh response received:", response.status);

        // EXTRACTION logic based on backend response structure:
        // Backend returns: { success: true, data: { accessToken: "..." } }
        const accessToken = response.data?.data?.accessToken;

        if (!accessToken) {
          throw new Error("No access token received from backend");
        }

        console.log("[Axios] Token refreshed successfully. Retrying queue...");

        Tokenservice.updateLocalAccessToken(accessToken);

        // Update header for the original request
        if (originalConfig.headers) {
          originalConfig.headers["Authorization"] = `Bearer ${accessToken}`;
        }

        // Process the queue
        processQueue(null, accessToken);

        return axiosInstance(originalConfig);
      } catch (refreshError: any) {
        console.error("[Axios] Refresh failed:", refreshError);
        processQueue(refreshError, null);
        Tokenservice.removeUser();
        // Ideally use a router push if accessible, or window.location as fallback
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/sign-in")
        ) {
          // Only redirect if not already there to avoid loose loops (though auth pages should be public)
          window.location.href = "/sign-in";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
