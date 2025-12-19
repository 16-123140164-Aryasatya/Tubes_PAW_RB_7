import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./user_dashboard.css";
import { BorrowAPI, BooksAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../auth/AuthContext";

/**
 * UserDashboard provides an overview for members.  It displays
 * active loans with due dates, new arrivals from the catalog and
 * summary stats.  Data is fetched from the backend via
 * /api/borrowings/my and /api/books.  Users can return books
 * directly from this page.
 */
const UserDashboard = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load active borrowings and books on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [brRes, booksRes] = await Promise.all([
          BorrowAPI.my(),
          BooksAPI.list(),
        ]);
        const brData = brRes.data?.data || brRes.data?.borrowings || brRes.data || [];
        const bookData = booksRes.data?.data || booksRes.data?.books || booksRes.data || [];
        if (alive) {
          setBorrowings(Array.isArray(brData) ? brData : []);
          setBooks(Array.isArray(bookData) ? bookData : []);
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

  // Enrich borrowings: compute status, dueDays, fine etc.
  const enrichedBorrowings = useMemo(() => {
    const now = new Date();
    return borrowings.map((br) => {
      const book = br.book || {};
      const dueDate = br.due_date ? new Date(br.due_date) : null;
      const diffDays = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : 0;
      let status;
      if (!br.return_date) {
        if (dueDate && dueDate < now) status = "urgent";
        else status = "ok";
      } else {
        status = "returned";
      }
      return {
        id: br.id,
        title: book.title || br.book_id,
        author: book.author || "",
        dueDate: dueDate ? dueDate.toLocaleDateString() : "-",
        dueDays: diffDays,
        status,
        coverUrl: book.cover_image || "",
        canRenew: false, // renew not implemented
      };
    });
  }, [borrowings]);

  // New arrivals: pick the 3 most recently added books (highest id)
  const newArrivals = useMemo(() => {
    const sorted = [...books].sort((a, b) => {
      // Sort descending by id (assumed to correlate with insertion time)
      const aid = parseInt(a.id?.toString().replace(/\D/g, "")) || 0;
      const bid = parseInt(b.id?.toString().replace(/\D/g, "")) || 0;
      return bid - aid;
    });
    return sorted.slice(0, 3).map((b) => {
      const availCount = b.copies_available ?? b.stock ?? b.quantity ?? 0;
      return {
        id: b.id,
        title: b.title,
        author: b.author || "",
        coverUrl: b.cover_image || "",
        statusLabel: availCount > 0 ? "Available Now" : "Waitlist",
        statusType: availCount > 0 ? "available" : "waitlist",
      };
    });
  }, [books]);

  // Stats for header cards.  The total borrowed and due soon are
  // derived from the enriched borrowings array.  Fine due is computed
  // based on days overdue × daily rate × number of books
  // Daily rate: Rp 5,000 per day per book
  const totalBorrowed = enrichedBorrowings.length;
  const dueSoonCount = enrichedBorrowings.filter((b) => b.status === "urgent").length;
  const DAILY_FINE_RATE = 5000; // Rp per day per book
  const fineDue = borrowings.reduce((sum, br) => {
    // Prefer the fine from the backend (br.fine) if present
    if (br.fine && !Number.isNaN(br.fine)) return sum + Number(br.fine);
    // Fallback: calculate fine for overdue borrowings using formula: Days Overdue × Daily Rate × Number of Books
    if (!br.return_date) {
      const due = br.due_date ? new Date(br.due_date) : null;
      if (due && due < new Date()) {
        const daysOverdue = Math.floor((new Date() - due) / (1000 * 60 * 60 * 24));
        return sum + (daysOverdue > 0 ? daysOverdue * DAILY_FINE_RATE : 0);
      }
    }
    return sum;
  }, 0);

  // Return a book from dashboard
  async function returnBook(borrowingId) {
    try {
      await BorrowAPI.returnBook(borrowingId);
      toast.push("Book returned", "success");
      setBorrowings((prev) => prev.filter((b) => b.id !== borrowingId));
    } catch (e) {
      toast.push(normalizeError(e), "error");
    }
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1>Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name || "Member"}!</h1>
            <p className="dashboard-subtitle">Manage your loans and find your next read.</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-row">
        <div className="stat-item stat-blue">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <div>
            <p className="stat-label">Active Loans</p>
            <p className="stat-value">{totalBorrowed} <span>books</span></p>
          </div>
        </div>
        <div className="stat-item stat-orange">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <div>
            <p className="stat-label">Due Soon / Overdue</p>
            <p className="stat-value">{dueSoonCount} <span>books</span></p>
          </div>
        </div>
        <div className="stat-item stat-green">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <div>
            <p className="stat-label">Estimated Fines</p>
            <p className="stat-value">Rp {fineDue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="section-header">
            <div className="section-title-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <h2>Currently Borrowed</h2>
                <p className="section-desc">Books you currently have borrowed from our library</p>
              </div>
            </div>
            {/* Hide view all since we are already on borrow page */}
          </div>
          <div className="books-list">
            {loading ? (
              <div>Loading...</div>
            ) : enrichedBorrowings.length === 0 ? (
              <div>No active loans.</div>
            ) : (
              enrichedBorrowings.map((book) => (
                <div key={book.id} className="book-card">
                  <div
                    className="book-cover"
                    style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined }}
                  />
                  <div className="book-details">
                    <div>
                      <div className="book-header">
                        <h3>{book.title}</h3>
                        <span className={`due-badge due-${book.status === "urgent" ? "urgent" : "ok"}`}>Due in {book.dueDays} days</span>
                      </div>
                      <p className="book-author">{book.author}</p>
                      <p className="book-meta">Due: {book.dueDate}</p>
                    </div>
                    <div className="book-actions">
                      <button className="btn-primary" disabled>
                        Renew
                      </button>
                      <button className="btn-secondary" onClick={() => returnBook(book.id)}>
                        Return
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="sidebar-section">
            <div className="section-header">
              <div className="section-title-with-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="section-icon">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div>
                  <h2>New Arrivals</h2>
                  <p className="section-desc">Latest books added to our catalog</p>
                </div>
              </div>
            </div>
            <div className="arrivals-list">
              {loading ? (
                <div>Loading...</div>
              ) : newArrivals.length === 0 ? (
                <div>No new arrivals.</div>
              ) : (
                newArrivals.map((book) => (
                  <a key={book.id} href={`/user/book/${book.id}`} className="arrival-card">
                    <div
                      className="arrival-cover"
                      style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined }}
                    />
                    <div className="arrival-info">
                      <h4>{book.title}</h4>
                      <p className="arrival-author">{book.author}</p>
                      <p className={`arrival-status ${book.statusType === 'waitlist' ? 'waitlist' : 'available'}`}>
                        {book.statusLabel}
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="promo-banner">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="promo-icon">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
              </svg>
              <p className="promo-label">Library News</p>
              <h3>Welcome to the Library!</h3>
              <p>Stay tuned for upcoming events and workshops.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;