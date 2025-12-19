import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLibrary } from "../store/LibraryStore";
import { useAuth } from "../auth/AuthContext";

function Item({ to, label, icon }) {
  return (
    <NavLink to={to} className={({ isActive }) => `sideLink ${isActive ? "active" : ""}`}>
      <span className="sideIcon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { quickReturn } = useLibrary();
  const { user } = useAuth();
  const [bookId, setBookId] = useState("");

  // Menu berdasarkan role
  const librarianMenu = [
    { to: "/", label: "Dashboard", icon: "▦" },
    { to: "/inventory", label: "Inventory", icon: "▣" },
    { to: "/requests", label: "Borrow Requests", icon: "📩" },
    { to: "/transactions", label: "Transactions", icon: "⇄" },
    { to: "/members", label: "Members", icon: "👥" },
    // Added manage books page for full CRUD operations on books
    { to: "/manage-books", label: "Manage Books", icon: "🛠️" },
  ];

  const userMenu = [
    { to: "/user/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/user/catalog", label: "Katalog Buku", icon: "📚" },
    { to: "/user/borrow", label: "Buku Saya", icon: "📖" },
    { to: "/user/history", label: "Riwayat", icon: "📋" },
    { to: "/user/profile", label: "Profil", icon: "👤" },
  ];

  const menuItems = user?.role === 'librarian' ? librarianMenu : userMenu;
  const brandTitle = user?.role === 'librarian' ? 'LibManager' : 'Perpustakaan';
  const brandSubtitle = user?.role === 'librarian' ? 'Staf Dashboard' : 'Member Portal';

  return (
    <aside className="sidebar">
      <div className="sideBrand">
        <div className="brandMark">📚</div>
        <div>
          <div className="brandName">{brandTitle}</div>
          <div className="brandSub">{brandSubtitle}</div>
        </div>
      </div>

      <div className="sideNav">
        {menuItems.map((item) => (
          <Item key={item.to} {...item} />
        ))}
      </div>

      <div className="sideSpacer" />

      {user?.role === 'librarian' && (
        <div className="quickReturn">
          <div className="qrTitle">Quick Return</div>
          <div className="qrRow">
            <input
              className="qrInput"
              placeholder="Enter Book ID (ex: B8492)"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
            />
            <button
              className="qrBtn"
              onClick={() => {
                if (!bookId.trim()) return;
                quickReturn(bookId.trim());
                setBookId("");
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      {user && (
        <div className="sideUser">
          <div className="userAvatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="userName">{user.name}</div>
            <div className="userRole">{user.role === 'librarian' ? 'Staf Perpustakaan' : 'Member'}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
