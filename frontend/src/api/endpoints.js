import { api } from "./client";

// Authentication endpoints matching the Pyramid backend.  Note that the
// backend exposes its auth routes under ``/api/auth``.
export const AuthAPI = {
  // Because api has baseURL '/api', specify endpoints without a leading slash.
  // POST /api/auth/login
  login: (payload) => api.post("auth/login", payload),
  // POST /api/auth/register
  register: (payload) => api.post("auth/register", payload),
  // GET /api/auth/me to fetch current user
  me: () => api.get("auth/me"),
};

export const BooksAPI = {
  // GET /api/books - list books
  list: () => api.get("books"),
  // GET /api/books/{id} - fetch a single book
  detail: (id) => api.get(`books/${id}`),
  // POST /api/books/create - create a book
  create: (payload) => api.post("books/create", payload),
  // PUT /api/books/{id}/update - update a book
  update: (id, payload) => api.put(`books/${id}/update`, payload),
  // DELETE /api/books/{id}/delete - delete a book
  remove: (id) => api.delete(`books/${id}/delete`),
  // GET /api/books/search?q=query - search books
  search: (q) => api.get(`books/search?q=${encodeURIComponent(q)}`),
};

export const BorrowAPI = {
  // GET /api/borrowings - list borrowings; supports optional status (pending, active, returned, overdue)
  list: (status) => api.get(status ? `borrowings?status=${status}` : "borrowings"),
  // POST /api/borrowings/borrow - create a new borrow request
  request: (payload) => api.post("borrowings/borrow", payload),
  // POST /api/borrowings/{id}/return - return a book (member or librarian)
  returnBook: (id) => api.post(`borrowings/${id}/return`),
  // GET /api/borrowings/my - list borrowings for the current user
  my: () => api.get("borrowings/my"),
  // GET /api/borrowings/history - list borrowing history for current user
  history: () => api.get("borrowings/history"),
  // POST /api/borrowings/{id}/approve - librarian approves a pending borrow request
  approve: (id) => api.post(`borrowings/${id}/approve`),
  // POST /api/borrowings/{id}/deny - librarian denies a pending borrow request
  deny: (id) => api.post(`borrowings/${id}/deny`),
  // POST /api/borrowings/{id}/approve-return - librarian approves a return request
  approveReturn: (id) => api.post(`borrowings/${id}/approve-return`),
  // POST /api/borrowings/{id}/deny-return - librarian denies a return request
  denyReturn: (id) => api.post(`borrowings/${id}/deny-return`),
};

// User management endpoints.  Currently only list is implemented
export const UserAPI = {
  // GET /api/users - list all users
  list: () => api.get("users"),
  // DELETE /api/users/{id} - delete a user (librarian only)
  delete: (id) => api.delete(`users/${id}`),
};
