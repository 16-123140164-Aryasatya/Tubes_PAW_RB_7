import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// Icon component for sidebar menu items
const Icon = ({ name }) => {
  const icons = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    inventory: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    requests: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    transactions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
    members: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    manage: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
    openbook: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
    history: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  };
  return icons[name] || null;
};

export default function Sidebar() {
  const { user, role } = useAuth();

  const librarianMenu = [
    { to: "/", label: "Dashboard", icon: "dashboard" },
    { to: "/inventory", label: "Inventory", icon: "inventory" },
    { to: "/requests", label: "Borrow Requests", icon: "requests" },
    { to: "/returning", label: "Returning", icon: "requests" },
    { to: "/transactions", label: "Transactions", icon: "transactions" },
    { to: "/members", label: "Members", icon: "members" },
    { to: "/manage-books", label: "Manage Books", icon: "manage" },
  ];

  const userMenu = [
    { to: "/user/dashboard", label: "Dashboard", icon: "home" },
    { to: "/user/catalog", label: "Katalog Buku", icon: "book" },
    { to: "/user/borrow", label: "Buku Saya", icon: "openbook" },
    { to: "/user/history", label: "Riwayat", icon: "history" },
    { to: "/user/profile", label: "Profil", icon: "user" },
  ];

  const menuItems = role === "librarian" ? librarianMenu : userMenu;

  return (
    <aside className="sidebar">
      <div className="sideBrand">
        <div className="brandMark">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <div>
          <div className="brandName">Perpustakaan Digital</div>
          <div className="brandSub">{role === "librarian" ? "Admin Panel" : "Member Portal"}</div>
        </div>
      </div>

      <nav className="sideNav">
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sideLink ${isActive ? "active" : ""}`}>
            <span className="sideIcon">
              <Icon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sideSpacer" />

      <div className="sideUser">
        <div className="userAvatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
        <div>
          <div className="userName">{user?.name ?? "User"}</div>
          <div className="userRole">{role === "librarian" ? "Admin" : "Member"}</div>
        </div>
      </div>
    </aside>
  );
}
