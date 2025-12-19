import axios from "axios";

// Simple in-memory cache for API responses
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

/**
 * Get from cache if available and not expired
 */
function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  const now = Date.now();
  if (now > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

/**
 * Set cache with TTL
 */
function setCache(key, data, ttl = CACHE_TTL) {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
}

/**
 * Clear cache for a specific key or all
 */
export function clearCache(key) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Create an Axios instance for API calls.  The base URL can be configured via
// the ``VITE_API_URL`` environment variable.  When running under the Vite
// development server, the ``vite.config.js`` proxy forwards all `/api` calls
// to the backend, so using a relative base URL avoids cross‑origin preflight
// requests.  In production, VITE_API_URL can point to the deployed API.
// Create an Axios instance for API calls.  The baseURL points to
// the API prefix (``/api``) by default.  Note: In Axios, a request
// URL that starts with a slash (e.g. ``/books``) will override the
// baseURL instead of being appended.  Therefore, all endpoint
// definitions in ``endpoints.js`` use *relative* paths without a
// leading slash so that ``baseURL`` and the path are joined
// correctly (e.g. baseURL ``/api`` + path ``books`` → ``/api/books``).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

/**
 * Cached GET request - returns cached data if available
 */
export async function cachedGet(url, config = {}) {
  const cacheKey = `GET:${url}`;
  
  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) return cached;
  
  // Make request
  const response = await api.get(url, config);
  
  // Cache response
  setCache(cacheKey, response);
  
  return response;
}

export function normalizeError(err) {
  // Normalise common error conditions.  Axios uses a special ``ERR_NETWORK``
  // code when the browser cannot reach the server (e.g. server down or CORS
  // misconfiguration).  In those cases we return a more friendly message.
  if (!err) return "Unknown error";
  const msg = err?.message || "";
  if (err.code === 'ERR_NETWORK' || msg.toLowerCase().includes('network error')) {
    return 'Network error: unable to connect to API';
  }
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    msg ||
    "Unknown error"
  );
}
