import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Driver, LoginInput, AuthResponse } from "../shared/schema";
import { apiService } from "@/services/api";

const AUTH_STORAGE_KEY = "@koligo_auth";

interface AuthContextValue {
  driver: Driver | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthResponse;
        setDriver(parsed.driver);
        setToken(parsed.token);
      }
    } catch (e) {
      console.error("Failed to load auth:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(input: LoginInput) {
    const response = await apiService.login(input);
    setDriver(response.driver);
    setToken(response.token);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response));
  }

  async function logout() {
    setDriver(null);
    setToken(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      driver,
      token,
      isLoading,
      isAuthenticated: !!driver && !!token,
      login,
      logout,
    }),
    [driver, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
