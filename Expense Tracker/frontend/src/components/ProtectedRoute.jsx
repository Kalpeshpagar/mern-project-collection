import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />; // ✅ visible feedback

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />;
};

export default ProtectedRoute;