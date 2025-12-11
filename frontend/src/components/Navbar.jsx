import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          📚 LibrarySystem
        </Link>

        <nav>
          {!user ? (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-btn">
                Register
              </Link>
            </>
          ) : (
            <>
              {user.role === "librarian" && (
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}
              <button onClick={logout} className="nav-btn danger">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
