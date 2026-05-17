"use client";
// ============================================
// دورك - Auth Context Provider
// ============================================

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser } from "@/types";
import { API } from "@/constants";
import axios from "axios";

interface AuthContextType {
  user: AuthUser | null;
  shopId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get(API.AUTH_ME, { withCredentials: true });
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser();
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await axios.post(
      API.AUTH_LOGIN,
      { email, password },
      { withCredentials: true }
    );
    if (res.data.success) {
      setUser(res.data.data.user);
    }
  };

  const logout = async () => {
    try {
      await axios.post(API.AUTH_LOGOUT, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Complete cleanup regardless of API success
      setUser(null);
      
      // Clear all possible local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies from client side (backup)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Force full reload to clear all React/Query states and avoid hydration issues
      window.location.href = "/login?logout=true";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shopId: user?.shopId || null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
