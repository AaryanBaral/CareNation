import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [expiryTime, setExpiryTime] = useState(null);
  const [loading, setLoading] = useState(true); 

  // ✅ Load token once on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedExpiry = localStorage.getItem("tokenExpiresAt");

    if (storedToken) setToken(storedToken);
    if (storedExpiry) setExpiryTime(new Date(storedExpiry));
        setLoading(false);
  }, []); 

  const setExpiry = () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 60 * 1000); 
    localStorage.setItem("tokenExpiresAt", expiresAt.toISOString());
    setExpiryTime(expiresAt);
  };

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setExpiry(); // ✅ optionally set expiry here
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiresAt");
    setToken(null);
    setExpiryTime(null);
  };

  const isTokenExpired = () => {
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return true;
    return new Date() > new Date(expiresAt);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, setExpiry, isTokenExpired, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
