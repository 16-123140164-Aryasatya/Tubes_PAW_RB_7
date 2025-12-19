import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./styles/base.css";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";

import { AuthProvider } from "./auth/AuthContext";
import { LibraryProvider } from "./store/LibraryStore";
// Toast provider adds contextual notifications for success/error messages.
import ToastProvider from "./components/Toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LibraryProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* Provide a dedicated register route so new users/librarians can sign up */}
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={<AppLayout />} />
            </Routes>
          </LibraryProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
