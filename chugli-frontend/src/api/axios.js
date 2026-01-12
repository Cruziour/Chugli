// src/api/axios.js

import axios from "axios";
// import { store } from "@/app/store";
import { updateTokens, clearAuth } from "@/features/auth/authSlice";
import { API_URL } from "@/utils/constants";

let storeRef; // 🔑 injected later

export const injectStore = (store) => {
  storeRef = store;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookies
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

// Process failed queue after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ============== Request Interceptor ==============

axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from Redux store
    const state = storeRef.getState();
    const accessToken = state.auth.accessToken;

    // Add Authorization header if token exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============== Response Interceptor ==============

axiosInstance.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(
        `❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        error.response?.data
      );
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry for login/register/refresh endpoints
      const authEndpoints = [
        "/auth/login",
        "/auth/register",
        "/auth/refresh-token",
      ];
      if (
        authEndpoints.some((endpoint) =>
          originalRequest.url?.includes(endpoint)
        )
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const state = storeRef.getState();
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Call refresh token endpoint
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update tokens in Redux
        storeRef.dispatch(
          updateTokens({
            accessToken,
            refreshToken: newRefreshToken,
          })
        );

        // Process queued requests
        processQueue(null, accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null);
        storeRef.dispatch(clearAuth());

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = "Network error. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);

// ============== Helper Functions ==============

// GET request
export const get = (url, config = {}) => axiosInstance.get(url, config);

// POST request
export const post = (url, data = {}, config = {}) =>
  axiosInstance.post(url, data, config);

// PUT request
export const put = (url, data = {}, config = {}) =>
  axiosInstance.put(url, data, config);

// PATCH request
export const patch = (url, data = {}, config = {}) =>
  axiosInstance.patch(url, data, config);

// DELETE request
export const del = (url, config = {}) => axiosInstance.delete(url, config);

export default axiosInstance;
