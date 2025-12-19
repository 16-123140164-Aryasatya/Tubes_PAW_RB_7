import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthed, user, role, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="brand" to="/">
          LibManager
        </Link>

        <nav className="nav-links">
          <NavLink to="/books" className={({ isActive }) => (isActive ? "active" : "")}>
            Books
          </NavLink>

          {role === "librarian" && (
            <>
              <NavLink to="/librarian" className={({ isActive }) => (isActive ? "active" : "")}>
                Librarian
              </NavLink>
              <NavLink
                to="/librarian/books"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Manage Books
              </NavLink>
              <NavLink
                to="/librarian/borrows"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Borrow Requests
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthed ? (
            <>
              <div className="nav-user">
                <div className="nav-user-name">{user?.name ?? "User"}</div>
                <div className="nav-user-role">{role}</div>
              </div>
              <button className="btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
