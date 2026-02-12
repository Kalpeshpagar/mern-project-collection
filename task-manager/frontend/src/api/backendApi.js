import axios from "axios"

const API = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true // required for cookies
})

// Building Axios Interceptor (Automatic Refresh System)
// Automatically calling refreshToken handler After it see --->

// User sends request →
// If 401 →
// Frontend automatically calls refresh →
// If refresh succeeds → retry original request →
// User never notices.

// That’s how Google, Netflix, etc. do it.

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    // If access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Call refresh endpoint
        await API.post("/users/refreshToken")

        // Retry original request
        return API(originalRequest)
      } catch (refreshError) {
        // Refresh failed → redirect to login
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)




export default API;