import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./user_dashboard.css";
import { BorrowAPI, BooksAPI } from "../src/api/endpoints";
import { normalizeError } from "../src/api/client";
import { useToast } from "../src/components/Toast";
import { useAuth } from "../src/auth/AuthContext";

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
  // based on the fine returned by the backend when available; if the
  // backend doesn't supply a fine yet, an estimate is made using the
  // number of days overdue.  This ensures the value reflects real data
  // whenever possible.
  const totalBorrowed = enrichedBorrowings.length;
  const dueSoonCount = enrichedBorrowings.filter((b) => b.status === "urgent").length;
  const fineDue = borrowings.reduce((sum, br) => {
    // Prefer the fine from the backend (br.fine) if present
    if (br.fine && !Number.isNaN(br.fine)) return sum + Number(br.fine);
    // Fallback: estimate fine for overdue borrowings
    if (!br.return_date) {
      const due = br.due_date ? new Date(br.due_date) : null;
      if (due && due < new Date()) {
        const daysLate = Math.floor((new Date() - due) / (1000 * 60 * 60 * 24));
        return sum + (daysLate > 0 ? daysLate * 1000 : 0);
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
        <div>
          <h1>Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name || "Member"}!</h1>
          <p className="dashboard-subtitle">Manage your loans and find your next read.</p>
        </div>
        <div className="dashboard-search">
          <input placeholder="Search your books..." disabled />
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-row">
        <div className="stat-item stat-blue">
          <div className="stat-icon">📚</div>
          <div>
            <p className="stat-label">Active Loans</p>
            <p className="stat-value">{totalBorrowed} <span>books</span></p>
          </div>
        </div>
        <div className="stat-item stat-orange">
          <div className="stat-icon">⏰</div>
          <div>
            <p className="stat-label">Due Soon / Overdue</p>
            <p className="stat-value">{dueSoonCount} <span>books</span></p>
          </div>
        </div>
        <div className="stat-item stat-green">
          <div className="stat-icon">💰</div>
          <div>
            <p className="stat-label">Estimated Fines</p>
            <p className="stat-value">Rp {fineDue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="section-header">
            <h2>📖 Currently Borrowed</h2>
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
                      <p className="book-meta">📅 Due: {book.dueDate}</p>
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
          <div className="section-header">
            <h2>✨ New Arrivals</h2>
          </div>
          <div className="arrivals-list">
            {loading ? (
              <div>Loading...</div>
            ) : newArrivals.length === 0 ? (
              <div>No new arrivals.</div>
            ) : (
              newArrivals.map((book) => (
                <Link key={book.id} to={`/user/book/${book.id}`} className="arrival-card">
                  <div
                    className="arrival-cover"
                    style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined }}
                  />
                  <div className="arrival-info">
                    <h4>{book.title}</h4>
                    <p className="arrival-author">{book.author}</p>
                    <p className={`arrival-status ${book.statusType === 'waitlist' ? 'waitlist' : ''}`}>
                      {book.statusLabel}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="promo-banner">
            <p className="promo-label">Library News</p>
            <h3>Welcome to the Library!</h3>
            <p>Stay tuned for upcoming events and workshops.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;