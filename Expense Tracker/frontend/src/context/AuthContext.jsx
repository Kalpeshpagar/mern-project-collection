import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, refreshToken } from "../api/auth.api";
import { getCategories } from "../api/category.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCategories, setHasCategories] = useState(false);

  // Init auth on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshToken(); 
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false); 
      }
    };

    initAuth();
  }, []);

  // Check categories ONLY after login
  useEffect(() => {
    if (!isAuthenticated) {
      setHasCategories(false);
      return;
    }

    const checkCategories = async () => {
      try {
        const res = await getCategories();
        const list = res.data?.data || res.data?.categories || [];
        setHasCategories(list.length > 0);
      } catch {
        setHasCategories(false);
      }
    };

    checkCategories();
  }, [isAuthenticated]);

  // Login
  const login = async (credentials) => {
    try {
      await loginUser(credentials);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed"
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
  setIsAuthenticated(false);
} finally {
      setIsAuthenticated(false);
      setHasCategories(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
        hasCategories
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);