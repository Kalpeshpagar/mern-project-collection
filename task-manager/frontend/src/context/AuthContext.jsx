import { createContext, useContext, useEffect, useState } from "react"
import { loginUser, logoutUser, refreshToken, registerUser } from "../api/auth.api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    // Auto Login Check
    // When app loads, we check if refresh token exists.

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await refreshToken()  // Calls /users/refreshToken
                setIsAuthenticated(true) // If refresh cookie exists → backend gives new access token
            } catch (error) {
                setIsAuthenticated(false)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    const register = async (data) => {
  try {
    await registerUser(data)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        "Registration failed"
    }
  }
}



    // Add Login & Logout Functions
    const login = async (data) => {
  try {
    await loginUser(data)
    setIsAuthenticated(true)
    return { success: true }
  } catch (error) {
    return {
  success: false,
  message:
    error.response?.data?.errors?.[0] ||
    error.response?.data?.message ||
    "Something went wrong"
}
  }
}


    const logout = async () => {
        try {
            await logoutUser()
            setIsAuthenticated(false)
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            loading,
            login,
            logout,
            register
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
// shortcut to access context anywhere