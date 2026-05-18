"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  type AuthUser,
  createAccount,
  getCurrentUser,
  loginUser,
  logoutUser,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = loginUser(email, password);
    if (result.success) {
      setUser(result.user);
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const result = createAccount(name, email, password);
    if (result.success) {
      setUser(result.user);
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: ready && user !== null,
      ready,
      login,
      signup,
      logout,
    }),
    [user, ready, login, signup, logout]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
