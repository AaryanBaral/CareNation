import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { token, isTokenExpired, logout, loading } = useAuth();
  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (!loading && isTokenExpired()) {
      logout();
      setValid(false);
    }
  }, [loading, isTokenExpired, logout]);

  if (loading) return null; // ✅ Wait for token to load

  if (!token || !valid) return <Navigate to="/login" />;
  return <Outlet />;
};


export default ProtectedRoute;
