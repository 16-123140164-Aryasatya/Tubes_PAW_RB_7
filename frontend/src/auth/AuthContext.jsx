import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "../api/endpoints";
import { setAuthToken, normalizeError } from "../api/client";

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

  // Initialize axios auth header on mount if token exists
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Save token to localStorage and set in axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem(LS_TOKEN, token);
      setAuthToken(token);
    } else {
      localStorage.removeItem(LS_TOKEN);
      setAuthToken(null);
    }
  }, [token]);

  // Save user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_USER);
    }
  }, [user]);

  const isAuthenticated = !!(token && user);
  const role = (user?.role || "").toLowerCase() === "member" ? "user" : user?.role;

  // Unified login. If a password is provided, authenticate against the backend
  // and normalise the returned role. Otherwise fall back to a mock login for
  // demonstration purposes. The returned object includes the user so callers
  // can determine redirect behaviour based on their role.
  async function login(payload) {
    setLoading(true);
    try {
      // Attempt backend authentication when a password is present
      if (payload?.password) {
        const res = await AuthAPI.login({ email: payload.email, password: payload.password });
        // Some backends nest the result in a "data" property, others return it at root
        const { data } = res.data || {};
        let userData = data?.user || res.data?.user || null;
        const token = data?.token || res.data?.token || null;
        if (token && userData) {
          // Normalise member -> user for the frontend role check
          if (userData.role && userData.role.toLowerCase() === 'member') {
            userData = { ...userData, role: 'user' };
          }
          setTokenState(token);
          setUser(userData);
          setAuthToken(token);
          return { ok: true, user: userData };
        }
        return { ok: false, message: 'Login gagal' };
      }

      // Fallback to frontend‑only login when no password provided.  This
      // simulates an authentication call and constructs a user object based
      // on the supplied email/name/role fields.  The role is taken as-is.
      await new Promise((resolve) => setTimeout(resolve, 500));
      const { email, role, name } = payload;
      const mockToken = `mock_token_${Date.now()}`;
      const userData = {
        id: Date.now().toString(),
        email: email || `${role}@library.com`,
        name: name || (role === 'user' ? 'Member Perpustakaan' : 'Staf Perpustakaan'),
        role,
        loginTime: new Date().toISOString(),
      };
      setTokenState(mockToken);
      setUser(userData);
      return { ok: true, user: userData };
    } catch (e) {
      return { ok: false, message: normalizeError(e) };
    } finally {
      setLoading(false);
    }
  }

  // Register against backend.  Accepts an optional role; when omitted it
  // defaults to "member".  Returns ok on success or an error message.
  async function register(name, email, password, role = 'member') {
    setLoading(true);
    try {
      const res = await AuthAPI.register({ name, email, password, role });
      // The backend returns {success, message, data: {user, token}} on success.
      if (res.status === 201 || res.data?.success) {
        const data = res.data?.data || {};
        return { ok: true, user: data.user, token: data.token };
      }
      return { ok: false, message: res.data?.message || 'Register failed' };
    } catch (e) {
      return { ok: false, message: normalizeError(e) };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setTokenState("");
    setUser(null);
  }

  const hasRole = (requiredRole) => {
    return user && user.role === requiredRole;
  };

  const value = {
    token,
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole,
    register,
    role
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
