import API from "./backendApi";

export const registerUser = (data) => {
  return API.post('/users/register', data)
}

export const loginUser = (data) => {
  return API.post('/users/login', data)
}

export const logoutUser = () => {
  return API.post('/users/logout')
}

export const refreshToken = () => {
  return API.post('/users/refreshToken')
}


