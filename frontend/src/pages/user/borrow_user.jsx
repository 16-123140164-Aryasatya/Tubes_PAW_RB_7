import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./borrow_user.css";
// Import API and helpers from src.  See note in catalog.jsx for path explanation.
import { BorrowAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";

/**
 * BorrowUser displays the current active borrowings for the logged in member.
 * It pulls data from the backend via /api/borrowings/my and allows the
 * member to return books.  Borrowings are classified into three states:
 *  - overdue: due_date < today
 *  - due-soon: due_date within 5 days
 *  - active: due_date farther away
 */
const BorrowUser = () => {
  const toast = useToast();
  const [borrowings, setBorrowings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch current borrowings on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await BorrowAPI.my();
        const data = res.data?.data || res.data?.borrowings || res.data || [];
        if (alive) setBorrowings(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.push(normalizeError(e), "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute derived values: counts and status classification
  const enriched = useMemo(() => {
    const now = new Date();
    return borrowings.map((br) => {
      const due = new Date(br.due_date);
      const borrowed = new Date(br.borrow_date);
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      let status;
      if (!br.return_date && due < now) status = "overdue";
      else if (!br.return_date && diffDays <= 5) status = "due-soon";
      else status = "active";
      return {
        id: br.id,
        title: br.book?.title || "Unknown",
        author: br.book?.author || "",
        category: br.book?.category || "",
        cover: br.book?.cover_image || "",
        borrowedDate: borrowed.toLocaleDateString(),
        dueDate: due.toLocaleDateString(),
        status,
        // Additional fields
        dueDays: diffDays,
        fine: br.fine || 0,
      };
    });
  }, [borrowings]);

  // Stats counts for header cards
  const totalBorrowed = enriched.length;
  const dueSoonCount = enriched.filter((b) => b.status === "due-soon").length;
  const overdueCount = enriched.filter((b) => b.status === "overdue").length;

  // Determine status badge styling
  function getStatusBadge(status) {
    switch (status) {
      case "overdue":
        return { label: "Overdue", className: "status-overdue" };
      case "due-soon":
        return { label: "Due Soon", className: "status-due-soon" };
      default:
        return { label: "Active", className: "status-active" };
    }
  }

  // Return a book - memoized to prevent unnecessary re-renders of child components
  const returnBook = useCallback(async (borrowingId) => {
    try {
      await BorrowAPI.returnBook(borrowingId);
      toast.push("Book returned", "success");
      // remove from current list
      setBorrowings((prev) => prev.filter((b) => b.id !== borrowingId));
    } catch (e) {
      toast.push(normalizeError(e), "error");
    }
  }, [toast]);

  return (
    <div className="borrow-container">
      {/* Alert for overdue fines */}
      {overdueCount > 0 && (
        <div className="alert-banner alert-danger">
          <div className="alert-content">
            <div className="alert-header">
              <span className="alert-icon"></span>
              <p className="alert-title">Action Required: Outstanding Fine</p>
            </div>
            <p className="alert-message">
              You have overdue books. Please return them to avoid additional fees.
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Current Borrowings</h1>
          <p className="page-subtitle">Manage your active loans, return books and track due dates.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📚</span>
            <p className="stat-label">Total Borrowed</p>
          </div>
          <p className="stat-value">{totalBorrowed}</p>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-header">
            <span className="stat-icon">⏰</span>
            <p className="stat-label">Due Soon</p>
          </div>
          <p className="stat-value">{dueSoonCount}</p>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-header">
            <span className="stat-icon">⚠️</span>
            <p className="stat-label">Overdue</p>
          </div>
          <p className="stat-value">{overdueCount}</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filter-bar">
        <div className="filter-chips">
          {['all', 'overdue', 'due-soon', 'active'].map((status) => (
            <button
              key={status}
              className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All Loans' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              {status === 'overdue' && overdueCount > 0 && <span className="chip-badge">{overdueCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Books List */}
      <div className="books-list">
        {loading ? (
          <div>Loading...</div>
        ) : enriched.filter((book) => filterStatus === 'all' || book.status === filterStatus).length === 0 ? (
          <div>No borrowings found.</div>
        ) : (
          enriched
            .filter((book) => filterStatus === 'all' || book.status === filterStatus)
            .map((book) => {
              const badge = getStatusBadge(book.status);
              const isOverdue = book.status === 'overdue';
              return (
                <div key={book.id} className={`book-item ${isOverdue ? 'book-item-overdue' : ''}`}>
                  <div className="book-cover-container">
                    {book.cover ? (
                      <img src={book.cover} alt={`Cover of ${book.title}`} className="book-cover" loading="lazy" />
                    ) : (
                      <div className="book-cover book-cover-placeholder" />
                    )}
                  </div>
                  <div className="book-info">
                    <div className="book-header">
                      <div>
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-meta">{book.author} • {book.category}</p>
                      </div>
                      <span className={`status-badge ${badge.className}`}>{badge.label}</span>
                    </div>
                    <div className="book-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Borrowed</span>
                        <span className="detail-value">{book.borrowedDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Due Date</span>
                        <span className={`detail-value ${isOverdue ? 'text-danger' : ''}`}>{book.dueDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Days Left</span>
                        <span className="detail-value">{book.dueDays >= 0 ? book.dueDays : 0}</span>
                      </div>
                    </div>
                    <div className="book-actions">
                      <button className="btn-return" onClick={() => returnBook(book.id)}>
                        ↩️ Return Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default BorrowUser;