import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLibrary } from "../store/LibraryStore";

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
  const [bookId, setBookId] = useState("");

  return (
    <aside className="sidebar">
      <div className="sideBrand">
        <div className="brandMark">📚</div>
        <div>
          <div className="brandName">LibManager</div>
          <div className="brandSub">Librarian Dashboard</div>
        </div>
      </div>

      <div className="sideNav">
        <Item to="/" label="Dashboard" icon="▦" />
        <Item to="/inventory" label="Inventory" icon="▣" />
        <Item to="/requests" label="Borrow Requests" icon="📩" />
        <Item to="/transactions" label="Transactions" icon="⇄" />
        <Item to="/members" label="Members" icon="👥" />
        <Item to="/settings" label="Settings" icon="⚙" />
      </div>

      <div className="sideSpacer" />

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

      <div className="sideUser">
        <div className="userAvatar">L</div>
        <div>
          <div className="userName">Head Librarian</div>
          <div className="userRole">Staff Console</div>
        </div>
      </div>
    </aside>
  );
}
