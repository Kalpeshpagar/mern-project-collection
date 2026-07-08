import axiosInstance from "../../api/axiosInstance.js";

// register
export const registerAPI = async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
};

// login
export const loginAPI = async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
};

// logout
export const logoutAPI = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
};

// get current user
export const getCurrentUserAPI = async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
};

// update profile
export const updateProfileAPI = async (data) => {
    const response = await axiosInstance.put("/auth/me", data);
    return response.data;
};

// change password
export const changePasswordAPI = async (data) => {
    const response = await axiosInstance.put("/auth/change-password", data);
    return response.data;
};