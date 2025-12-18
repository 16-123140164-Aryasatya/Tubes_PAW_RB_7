import { api } from "./client";

export const AuthAPI = {
  login: (payload) => api.post("/api/auth/login", payload),
  register: (payload) => api.post("/api/auth/register", payload),
  me: () => api.get("/api/auth/me"),
};

export const BooksAPI = {
  list: () => api.get("/api/books"),
  detail: (id) => api.get(`/api/books/${id}`),
  create: (payload) => api.post("/api/books", payload),
  update: (id, payload) => api.put(`/api/books/${id}`, payload),
  remove: (id) => api.delete(`/api/books/${id}`),
};

export const BorrowAPI = {
  list: () => api.get("/api/borrows"),
  request: (payload) => api.post("/api/borrows", payload),
  approve: (id) => api.post(`/api/borrows/${id}/approve`),
  reject: (id) => api.post(`/api/borrows/${id}/reject`),
  returnBook: (id) => api.post(`/api/borrows/${id}/return`),
};
