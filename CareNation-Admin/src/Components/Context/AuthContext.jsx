import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import baseApi from "../Constants/baseApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));
  const [expiresAt, setExpiresAt] = useState(() => {
    const stored = localStorage.getItem("adminTokenExpiresAt");
    return stored ? new Date(stored) : null;
  });
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem("adminProfile");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem("adminProfile");
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      baseApi.defaults.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem("adminToken", token);
    } else {
      delete baseApi.defaults.headers.Authorization;
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  const setExpiry = useCallback((durationMs = 10 * 60 * 60 * 1000) => {
    const expiryDate = new Date(Date.now() + durationMs);
    setExpiresAt(expiryDate);
    localStorage.setItem("adminTokenExpiresAt", expiryDate.toISOString());
  }, []);

  const isTokenExpired = useCallback(() => {
    if (!expiresAt) return true;
    return Date.now() > expiresAt.getTime();
  }, [expiresAt]);

  const login = useCallback(
    (newToken, adminProfile = null, durationMs) => {
      setToken(newToken);
      if (durationMs) {
        setExpiry(durationMs);
      } else {
        setExpiry();
      }
      if (adminProfile) {
        setProfile(adminProfile);
        localStorage.setItem("adminProfile", JSON.stringify(adminProfile));
      }
    },
    [setExpiry]
  );

  const logout = useCallback(() => {
    setToken(null);
    setExpiresAt(null);
    setProfile(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminTokenExpiresAt");
    localStorage.removeItem("adminProfile");
  }, []);

  useEffect(() => {
    if (token && !expiresAt) {
      setExpiry();
    }
  }, [token, expiresAt, setExpiry]);

  useEffect(() => {
    if (!expiresAt) return;
    const timeout = setInterval(() => {
      if (isTokenExpired()) {
        logout();
      }
    }, 60 * 1000);

    return () => clearInterval(timeout);
  }, [expiresAt, isTokenExpired, logout]);

  const value = useMemo(
    () => ({
      token,
      profile,
      isAuthenticated: Boolean(token) && !isTokenExpired(),
      login,
      logout,
      setExpiry,
      isTokenExpired,
      setProfile: (data) => {
        setProfile(data);
        if (data) localStorage.setItem("adminProfile", JSON.stringify(data));
        else localStorage.removeItem("adminProfile");
      },
    }),
    [token, profile, isTokenExpired, login, logout, setExpiry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
