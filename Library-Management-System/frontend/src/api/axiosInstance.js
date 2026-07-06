import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
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

        // if 401 and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {
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
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;