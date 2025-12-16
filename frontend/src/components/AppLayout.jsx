import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import Dashboard from "../pages/librarian/Dashboard";
import Inventory from "../pages/librarian/Inventory";
import BorrowRequests from "../pages/librarian/BorrowRequests";
import Transactions from "../pages/librarian/Transactions";
import Members from "../pages/librarian/Members";

export default function AppLayout() {
  return (
    <div className="appShell">
      <Sidebar />
      <div className="appMain">
        <Topbar />
        <main className="page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/requests" element={<BorrowRequests />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/members" element={<Members />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
