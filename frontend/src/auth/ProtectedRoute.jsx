import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "../components/Loading";

export default function ProtectedRoute({ requireAuth = true, roles = [] }) {
  const { booted, isAuthed, role } = useAuth();

  if (!booted) return <Loading label="Loading session..." />;

  if (requireAuth && !isAuthed) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
