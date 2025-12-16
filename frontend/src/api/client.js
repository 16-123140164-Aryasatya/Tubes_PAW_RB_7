import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "", // kalau backend beda origin isi di .env: VITE_API_URL=http://localhost:5000
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function normalizeError(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Unknown error"
  );
}
