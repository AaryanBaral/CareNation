import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import baseApi from "../Constants/baseApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [expiryTime, setExpiryTime] = useState(() => {
    const stored = localStorage.getItem("tokenExpiresAt");
    return stored ? new Date(stored) : null;
  });
  const [isDistributor, setIsDistributor] = useState(
    () => localStorage.getItem("isDistributor") === "true"
  );
  const [isImpersonating, setIsImpersonating] = useState(
    () => localStorage.getItem("isImpersonating") === "true"
  );

  const setExpiry = useCallback((durationMs = 10 * 60 * 60 * 1000) => {
    const expiresAt = new Date(Date.now() + durationMs);
    localStorage.setItem("tokenExpiresAt", expiresAt.toISOString());
    setExpiryTime(expiresAt);
  }, []);

  const login = useCallback(
    (newToken, durationMs) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setExpiry(durationMs);
    },
    [setExpiry]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiresAt");
    localStorage.removeItem("isImpersonating");
    localStorage.removeItem("impersonationReturnUrl");
    setToken(null);
    setExpiryTime(null);
    setIsImpersonating(false);
    setIsDistributor(false);
  }, []);

  const isTokenExpired = useCallback(() => {
    if (!expiryTime) return true;
    return Date.now() > expiryTime.getTime();
  }, [expiryTime]);

  useEffect(() => {
    localStorage.setItem("isDistributor", isDistributor);
  }, [isDistributor]);

  useEffect(() => {
    if (token) {
      baseApi.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete baseApi.defaults.headers.Authorization;
    }
  }, [token]);

  useEffect(() => {
    if (isImpersonating) localStorage.setItem("isImpersonating", "true");
    else localStorage.removeItem("isImpersonating");
  }, [isImpersonating]);

  const exitImpersonation = useCallback(() => {
    const ret = localStorage.getItem("impersonationReturnUrl");
    logout();
    window.location.assign(ret || "http://localhost:5173/");
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      setToken,
      isDistributor,
      setIsDistributor,
      login,
      logout,
      setExpiry,
      isTokenExpired,
      isImpersonating,
      setIsImpersonating,
      exitImpersonation,
    }),
    [
      token,
      isDistributor,
      login,
      logout,
      setExpiry,
      isTokenExpired,
      isImpersonating,
      exitImpersonation,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
