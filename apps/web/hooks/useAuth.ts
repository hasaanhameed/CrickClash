"use client";

import { useCallback, useState } from "react";
import { loginUser, registerUser } from "../services/auth.service";
import type { LoginPayload, RegisterPayload } from "../types/auth";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await loginUser(payload);
      localStorage.setItem("accessToken", accessToken);
      return true;
    } catch {
      setError("Invalid username or password");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

  return { login, register, logout, loading, error };
}
