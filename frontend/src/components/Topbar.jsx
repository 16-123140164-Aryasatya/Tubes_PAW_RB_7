import React from "react";
import { useLocation } from "react-router-dom";

export default function Topbar() {
  const loc = useLocation();
  const title =
    loc.pathname === "/inventory" ? "Inventory" :
    loc.pathname === "/requests" ? "Borrow Requests" :
    loc.pathname === "/transactions" ? "Transactions" :
    loc.pathname === "/members" ? "Members" : "Dashboard";

  return (
    <header className="topbar">
      <div className="topTitle">{title}</div>

      <div className="searchBox">
        <span className="searchIcon">🔎</span>
        <input className="searchInput" placeholder="Search..." />
      </div>

      <div className="topIcons">
        <button className="iconCircle" title="Notifications" onClick={() => alert("Notifications (mock)")}>🔔</button>
        <button className="iconCircle" title="Help" onClick={() => alert("Help (mock)")}>?</button>
      </div>
    </header>
  );
}
