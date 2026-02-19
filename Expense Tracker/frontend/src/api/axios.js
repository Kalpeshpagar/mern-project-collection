import axios from "axios";
import { refreshToken } from "./auth.api";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

// Flag to prevent infinite loops
let isRefreshing = false;
let failedQueue = [];

// helper to resolve queued requests
const processQueue = (error = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If unauthorized & not retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If refresh already in progress → queue request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      isRefreshing = true;

      try {
        // Call refresh token API
        await refreshToken();

        // Retry all queued requests
        processQueue();

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    //  Other errors
    return Promise.reject(error);
  }
);

export default api;
