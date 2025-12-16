import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthAPI } from "../api/endpoints";
import { normalizeError, setAuthToken } from "../api/client";

const Ctx = createContext(null);

const LS_TOKEN = "libmanager_token";
const LS_USER = "libmanager_user";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(LS_TOKEN) || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // set axios auth header whenever token changes
  useEffect(() => {
    setAuthToken(token || "");
    if (token) localStorage.setItem(LS_TOKEN, token);
    else localStorage.removeItem(LS_TOKEN);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(LS_USER, JSON.stringify(user));
    else localStorage.removeItem(LS_USER);
  }, [user]);

  const isAuthenticated = !!token;

  async function login(payload) {
    setLoading(true);
    try {
      const res = await AuthAPI.login(payload);
      // asumsi backend balikin { token, user: { name, role } }
      const nextToken = res.data?.token || "";
      const nextUser = res.data?.user || { name: payload.email || "Librarian", role: "librarian" };

      setTokenState(nextToken);
      setUser(nextUser);

      return { ok: true };
    } catch (e) {
      return { ok: false, message: normalizeError(e) };
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);
    try {
      const res = await AuthAPI.register(payload);
      // kalau register auto-login: { token, user }
      const nextToken = res.data?.token || "";
      const nextUser = res.data?.user || { name: payload.name || "User", role: "member" };

      if (nextToken) setTokenState(nextToken);
      setUser(nextUser);

      return { ok: true };
    } catch (e) {
      return { ok: false, message: normalizeError(e) };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setTokenState("");
    setUser(null);
    setAuthToken("");
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, loading, login, register, logout }),
    [token, user, isAuthenticated, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
