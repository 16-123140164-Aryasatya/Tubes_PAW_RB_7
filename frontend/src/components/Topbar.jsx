import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const title =
    loc.pathname === "/inventory" ? "Inventory" :
    loc.pathname === "/requests" ? "Borrow Requests" :
    loc.pathname === "/transactions" ? "Transactions" :
    loc.pathname === "/members" ? "Members" : 
    loc.pathname.startsWith("/user") ? "Member Dashboard" : "Dashboard";

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const getRoleBadge = () => {
    if (!user) return null;
    
    const roleInfo = {
      user: { label: 'Member', icon: '👤', color: '#10b981' },
      librarian: { label: 'Staf', icon: '👨‍💼', color: '#137fec' }
    };

    const info = roleInfo[user.role] || roleInfo.user;
    
    return (
      <div className="role-badge" style={{ background: info.color }}>
        <span>{info.icon}</span>
        <span>{info.label}</span>
      </div>
    );
  };

  return (
    <header className="topbar">
      <div className="topTitle">{title}</div>

      <div className="searchBox">
        <span className="searchIcon">🔎</span>
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
              🚪
            </button>
          </>
        )}
      </div>
    </header>
  );
}
