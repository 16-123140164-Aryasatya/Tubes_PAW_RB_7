import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar() {
  const { user, role } = useAuth();

  const librarianMenu = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/inventory", label: "Inventory", icon: "📦" },
    { to: "/requests", label: "Borrow Requests", icon: "📋" },
    { to: "/transactions", label: "Transactions", icon: "💳" },
    { to: "/members", label: "Members", icon: "👥" },
    { to: "/manage-books", label: "Manage Books", icon: "✏️" },
  ];

  const userMenu = [
    { to: "/user/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/user/catalog", label: "Katalog Buku", icon: "📚" },
    { to: "/user/borrow", label: "Buku Saya", icon: "📖" },
    { to: "/user/history", label: "Riwayat", icon: "⏱️" },
    { to: "/user/profile", label: "Profil", icon: "👤" },
  ];

  const menuItems = role === "librarian" ? librarianMenu : userMenu;

  return (
    <aside className="sidebar">
      <div className="sideBrand">
        <div className="brandMark">📖</div>
        <div>
          <div className="brandName">Librarizz</div>
          <div className="brandSub">{role === "librarian" ? "Admin Panel" : "Member Portal"}</div>
        </div>
      </div>

      <nav className="sideNav">
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sideLink ${isActive ? "active" : ""}`}>
            <span className="sideIcon">{item.icon}</span>
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
