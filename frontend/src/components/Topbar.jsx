import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const title =
    // Show a friendly title based on the current route.  This list
    // enumerates all top‑level routes; if none match the default is
    // "Dashboard".
    loc.pathname === "/inventory" ? "Inventory" :
    loc.pathname === "/requests" ? "Borrow Requests" :
    loc.pathname === "/transactions" ? "Transactions" :
    loc.pathname === "/members" ? "Members" :
    loc.pathname === "/manage-books" ? "Manage Books" :
    // Any page under the user namespace shows the member dashboard title
    loc.pathname.startsWith("/user") ? "Member Dashboard" : "Dashboard";

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const getRoleBadge = () => {
    if (!user) return null;
    
    const roleInfo = {
      user: { label: 'Member', color: '#10b981' },
      librarian: { label: 'Staf', color: '#137fec' }
    };

    const info = roleInfo[user.role] || roleInfo.user;
    return (
      <div className="role-badge" style={{ background: info.color }}>
        {/* Only render the label; icons are removed for a cleaner look */}
        <span>{info.label}</span>
      </div>
    );
  };

  return (
    <header className="topbar">
      <div className="topTitle">{title}</div>

      <div className="searchBox">
        {/* Remove magnifying glass icon; rely on placeholder instead */}
        <input className="searchInput" placeholder="Search..." />
      </div>

      <div className="topIcons">
        {user && (
          <>
            {getRoleBadge()}
            <div className="user-info">
              <span className="user-name">{user.name}</span>
            </div>
            <button className="iconCircle logout-btn" title="Logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
