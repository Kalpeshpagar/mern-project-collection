import api from "./axios";

// register
export const registerUser = (data) => {
  return api.post("/users/register", data);
};

// login
export const loginUser = (data) => {
  return api.post("/users/login", data);
};

// logout
export const logoutUser = () => {
  return api.post("/users/logout");
};

// refresh token
export const refreshToken = () => {
  return api.post("/users/refresh-token");
};
