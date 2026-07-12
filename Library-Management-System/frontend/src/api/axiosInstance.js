import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
    withCredentials: true,   // sends cookies (accessToken) with every request
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Request interceptor ───────────────────────────────────────────────────
// runs before every request — attaches accessToken from localStorage if exists
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────
// runs on every response — handles token expiry globally
axiosInstance.interceptors.response.use(
    (response) => response,   // success — pass through untouched

    async (error) => {
        const originalRequest = error.config;

        // Check if the request is an auth-related request where we shouldn't attempt token refresh
        const isAuthRequest =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/refresh-token");

        // if 401 and we haven't already retried this request and it is not an auth request
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthRequest
        ) {
            originalRequest._retry = true;   // flag to prevent infinite retry loop

            try {
                // attempt to refresh the access token
                const res = await axiosInstance.post("/auth/refresh-token");
                const newToken = res.data.accessToken;

                // store new token
                localStorage.setItem("accessToken", newToken);

                // retry the original failed request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // refresh failed — token truly expired, force logout
                localStorage.removeItem("accessToken");
                // Only redirect if we are not already on the login or register pages to avoid infinite page refreshes
                if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;