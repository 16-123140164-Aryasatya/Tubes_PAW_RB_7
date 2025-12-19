import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ProtectedRoute from "../auth/ProtectedRoute";
import Loading from "./Loading";

// Eager load essential pages
import Dashboard from "../pages/librarian/Dashboard";

// Lazy load heavy pages for faster initial page load
const Inventory = React.lazy(() => import("../pages/librarian/Inventory"));
const BorrowRequests = React.lazy(() => import("../pages/librarian/BorrowRequests"));
const Transactions = React.lazy(() => import("../pages/librarian/Transactions"));
const Members = React.lazy(() => import("../pages/librarian/Members"));
const ManageBooks = React.lazy(() => import("../pages/librarian/ManageBooks"));

// Lazy load user pages
const UserProfile = React.lazy(() => import("../pages/user/user_profile"));
const UserDashboard = React.lazy(() => import("../pages/user/user_dashboard"));
const HistoryBorrow = React.lazy(() => import("../pages/user/history_borrow"));
const Catalog = React.lazy(() => import("../pages/user/catalog"));
const BorrowUser = React.lazy(() => import("../pages/user/borrow_user"));
const BookDetail = React.lazy(() => import("../pages/user/book_detail"));

export default function AppLayout() {
  return (
    <div className="appShell">
      <Sidebar />
      <div className="appMain">
        <Topbar />
        <main className="page">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Librarian Routes - hanya untuk role 'librarian' */}
              <Route path="/" element={
                <ProtectedRoute requiredRole="librarian">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute requiredRole="librarian">
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/requests" element={
                <ProtectedRoute requiredRole="librarian">
                  <BorrowRequests />
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute requiredRole="librarian">
                  <Transactions />
                </ProtectedRoute>
              } />
              <Route path="/members" element={
                <ProtectedRoute requiredRole="librarian">
                  <Members />
                </ProtectedRoute>
              } />

              {/* Manage books page for librarians */}
              <Route path="/manage-books" element={
                <ProtectedRoute requiredRole="librarian">
                  <ManageBooks />
                </ProtectedRoute>
              } />

              {/* User Routes - hanya untuk role 'user' */}
              <Route path="/user/profile" element={
                <ProtectedRoute requiredRole="user">
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/user/dashboard" element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/user/history" element={
                <ProtectedRoute requiredRole="user">
                  <HistoryBorrow />
                </ProtectedRoute>
              } />
              <Route path="/user/catalog" element={
                <ProtectedRoute requiredRole="user">
                  <Catalog />
                </ProtectedRoute>
              } />
              <Route path="/user/borrow" element={
                <ProtectedRoute requiredRole="user">
                  <BorrowUser />
                </ProtectedRoute>
              } />
              <Route path="/user/book/:id" element={
                <ProtectedRoute requiredRole="user">
                  <BookDetail />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
