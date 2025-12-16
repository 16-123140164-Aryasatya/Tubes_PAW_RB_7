import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Dashboard from "./pages/Dashboard";

import { setToken } from "./api/api";

export default function App() {
  const [user, setUser] = useState(null);

  // Load user dari localStorage saat pertama kali render
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Books />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />

        {/* Librarian-only pages */}
        {user?.role === "librarian" && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/borrow" element={<Borrow />} />
          </>
        )}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
