"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMe, loginUser, registerUser } from "../services/auth.service";
import type { CurrentUser, LoginPayload, RegisterPayload } from "../types/auth";

interface AuthContextValue {
  user: CurrentUser | null;
  isLoadingUser: boolean;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On first load, if we already have a token saved, fetch who it belongs to
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setIsLoadingUser(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      // token was invalid/expired
      localStorage.removeItem("accessToken");
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      setError(null);
      try {
        const { accessToken } = await loginUser(payload);
        localStorage.setItem("accessToken", accessToken);
        await fetchUser();
        return true;
      } catch {
        setError("Invalid username or password");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchUser],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setLoading(true);
      setError(null);
      try {
        await registerUser(payload);
        // register endpoint doesn't return a token, so log in right after
        return await login(payload);
      } catch {
        setError("Registration failed — username may already be taken");
        setLoading(false);
        return false;
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoadingUser, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
