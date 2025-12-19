import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./borrow_user.css";
// Import API and helpers from src.  See note in catalog.jsx for path explanation.
import { BorrowAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";
import BookCover from "../../components/BookCover";
import Loading from "../../components/Loading";

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
  const [viewMode, setViewMode] = useState("active"); // "active" atau "pending"
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [returningId, setReturningId] = useState(null); // track which book is being returned
  const [showLoading, setShowLoading] = useState(false);

  // Fetch current borrowings on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await BorrowAPI.my();
        const data = res.data?.data || res.data?.borrowings || res.data || [];
        if (alive) {
          // Jangan filter pending - tampilkan semua (pending + active)
          const normalized = Array.isArray(data) ? data : [];
          setBorrowings(normalized);
        }
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

  // Enrich borrowings - terpisah untuk active dan pending
  const enriched = useMemo(() => {
    const now = new Date();
    if (viewMode === "pending") {
      // Tampilkan hanya pending (menunggu persetujuan librarian)
      return borrowings
        .filter((br) => (br.status || "").toString().toLowerCase() === "pending")
        .map((br) => {
          const due = br.due_date ? new Date(br.due_date) : null;
          const isReturnPending = !!br.return_date; // return_date di-set saat request return
          const diffDays = due ? Math.ceil((due - now) / (1000 * 60 * 60 * 24)) : "-";
          return {
            id: br.id,
            title: br.book?.title || "Unknown",
            author: br.book?.author || "",
            category: br.book?.category || "",
            cover: "",
            borrowedDate: br.borrow_date ? new Date(br.borrow_date).toLocaleDateString() : "-",
            dueDate: due ? due.toLocaleDateString() : "-",
            status: "pending-approval",
            dueDays: isReturnPending && typeof diffDays === "number" ? diffDays : "N/A",
            fine: 0,
            returnPending: isReturnPending,
          };
        });
    } else {
      // Tampilkan active dan overdue (sudah diapprove)
      return borrowings
        .filter((br) => {
          const status = (br.status || "").toString().toLowerCase();
          return status === "active" || status === "overdue";
        })
        .map((br) => {
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
            dueDays: diffDays,
            fine: br.fine || 0,
          };
        });
    }
  }, [borrowings, viewMode]);

  // Stats counts for header cards - count total active/overdue borrowings only (not pending)
  const activeBorrowings = useMemo(() => {
    return borrowings.filter((br) => {
      const status = (br.status || "").toString().toLowerCase();
      return status === "active" || status === "overdue";
    });
  }, [borrowings]);
  
  const pendingBorrowings = useMemo(() => {
    return borrowings.filter((br) => (br.status || "").toString().toLowerCase() === "pending");
  }, [borrowings]);

  const totalBorrowed = activeBorrowings.length;
  const dueSoonCount = activeBorrowings.filter((br) => {
    const now = new Date();
    const due = new Date(br.due_date);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays > 0;
  }).length;
  const overdueCount = activeBorrowings.filter((br) => {
    const now = new Date();
    const due = new Date(br.due_date);
    return due < now;
  }).length;

  // Determine status badge styling
  function getStatusBadge(status) {
    switch (status) {
      case "overdue":
        return { label: "Overdue", className: "status-overdue" };
      case "due-soon":
        return { label: "Due Soon", className: "status-due-soon" };
      case "pending-approval":
        return { label: "Menunggu Approval", className: "status-pending" };
      default:
        return { label: "Active", className: "status-active" };
    }
  }

  // Return a book - memoized to prevent unnecessary re-renders of child components
  const returnBook = useCallback(async (borrowingId) => {
    try {
      setReturningId(borrowingId);
      setShowLoading(true);
      setModalMessage("Permintaan pengembalian sedang diproses...");
      setShowModal(true);
      await BorrowAPI.returnBook(borrowingId);
      setModalMessage("✓ Permintaan pengembalian dikirim!\nMenunggu konfirmasi librarian");
      setTimeout(() => {
        setShowModal(false);
        setShowLoading(false);
        setReturningId(null);
        // Refetch untuk sinkronisasi
        (async () => {
          try {
            const res = await BorrowAPI.my();
            const data = res.data?.data || res.data?.borrowings || res.data || [];
            const normalized = Array.isArray(data) ? data : [];
            setBorrowings(normalized);
          } catch (e) {
            console.error("Failed to refetch", e);
          }
        })();
      }, 2000);
    } catch (e) {
      setReturningId(null);
      setShowLoading(false);
      setModalMessage(`✗ Gagal: ${normalizeError(e)}`);
      setTimeout(() => setShowModal(false), 3000);
      toast.push(normalizeError(e), "error");
    }
  }, [toast]);

  return (
    <div className="borrow-container">
      {showLoading && <Loading label="Memproses permintaan pengembalian..." fullScreen />}
      
      {/* Notification Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            minWidth: "300px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              ⏳
            </div>
            <div style={{ fontSize: "18px", fontWeight: "600", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
              {modalMessage}
            </div>
          </div>
        </div>
      )}

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
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </span>
            <p className="stat-label">Total Borrowed</p>
          </div>
          <p className="stat-value">{totalBorrowed}</p>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-header">
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span>
            <p className="stat-label">Due Soon</p>
          </div>
          <p className="stat-value">{dueSoonCount}</p>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-header">
            <span className="stat-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </span>
            <p className="stat-label">Overdue</p>
          </div>
          <p className="stat-value">{overdueCount}</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="filter-bar">
        <div className="filter-chips">
          <button
            className={`filter-chip ${viewMode === "active" ? "active" : ""}`}
            onClick={() => setViewMode("active")}
          >
            Active Loans ({activeBorrowings.length})
          </button>
          <button
            className={`filter-chip ${viewMode === "pending" ? "active" : ""}`}
            onClick={() => setViewMode("pending")}
          >
            Pending Approval ({pendingBorrowings.length})
          </button>
        </div>
      </div>

      {/* Books List */}
      <div className="books-list">
        {loading ? (
          <div>Loading...</div>
        ) : enriched.length === 0 ? (
          <div>{viewMode === "pending" ? "No pending approval requests." : "No active borrowings."}</div>
        ) : (
          enriched.map((book) => {
            const badge = getStatusBadge(book.status);
            const isOverdue = book.status === 'overdue';
            const isPending = book.status === 'pending-approval';
            const isReturnPending = !!book.returnPending;
            return (
              <div key={book.id} className={`book-item ${isOverdue ? 'book-item-overdue' : ''}`}>
                <div className="book-cover-container">
                  <BookCover src={book.cover} size="md" style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }} />
                </div>
                <div className="book-info">
                  <div className="book-header">
                    <div>
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-meta">{book.author} • {book.category}</p>
                    </div>
                    <span className={`status-badge ${badge.className}`}>
                      {isPending ? "Menunggu Approval" : badge.label}
                    </span>
                  </div>
                  <div className="book-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Borrowed</span>
                      <span className="detail-value">{book.borrowedDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{isPending && !isReturnPending ? "Estimated Due" : "Due Date"}</span>
                      <span className={`detail-value ${isOverdue ? 'text-danger' : ''}`}>{book.dueDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Days Left</span>
                      <span className="detail-value">{typeof book.dueDays === "number" && book.dueDays >= 0 ? book.dueDays : "N/A"}</span>
                    </div>
                  </div>
                  {isPending && (
                    <div style={{ padding: "12px", backgroundColor: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "6px", marginTop: "12px" }}>
                      <p style={{ margin: 0, fontSize: "14px", color: "#1976d2", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>ℹ️</span>
                        {isReturnPending
                          ? "Permintaan pengembalian Anda sedang menunggu persetujuan dari librarian. Buku akan ditandai dikembalikan setelah disetujui."
                          : "Permintaan peminjaman Anda sedang menunggu persetujuan dari librarian. Anda akan dapat mengakses buku setelah disetujui."}
                      </p>
                    </div>
                  )}
                  {!isPending && (
                    <div className="book-actions">
                      <button
                        className="btn-return"
                        onClick={() => returnBook(book.id)}
                        disabled={book.status === 'returned' || returningId === book.id}
                        style={{
                          opacity: returningId === book.id ? 0.7 : 1,
                          cursor: returningId === book.id ? 'wait' : 'pointer'
                        }}
                      >
                        {returningId === book.id ? '⏳ Memproses...' : '↩️ Return Book'}
                      </button>
                    </div>
                  )}
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