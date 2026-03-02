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
  const value = useMemo(
    () => ({
      driver: {
        id: 1,
        name: "John Doe",
        phone: "1234567890",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      token: "mock-token",
      isLoading: false,
      isAuthenticated: true,
      login: async () => {},
      logout: async () => {},
    }),
    []
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
