import React, { useEffect, useMemo, useState } from "react";
import "./history_borrow.css";
// Use API helpers from the src folder.  Because ui_user lives outside
// of src, we import via relative path.  These helpers handle
// authorization headers and base URL configuration.
import { BorrowAPI, BooksAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";

/**
 * HistoryBorrow renders the borrowing history for the current user.  It
 * pulls data from the backend via /api/borrowings/history and
 * /api/books to join book details with borrowing records.  Users can
 * search and filter by status, and return currently borrowed books
 * directly from this page.  Summary stats show total borrowed books,
 * active/overdue loans and estimated unpaid fines.
 */
const HistoryBorrow = () => {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all"); // all, 1month, 3months

  // Fetch borrow history and books on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [histRes, booksRes] = await Promise.all([
          BorrowAPI.history(),
          BooksAPI.list(),
        ]);
        const histData = histRes.data?.data || histRes.data?.borrowings || histRes.data || [];
        const bookData = booksRes.data?.data || booksRes.data?.books || booksRes.data || [];
        if (alive) {
          setHistory(Array.isArray(histData) ? histData : []);
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

  // Create a map of book id to book for easy lookup
  const bookMap = useMemo(() => {
    const map = {};
    books.forEach((b) => {
      map[b.id] = b;
    });
    return map;
  }, [books]);

  // Enrich history with book details and computed status/fine
  const enriched = useMemo(() => {
    const now = new Date();
    return history.map((br) => {
      const book = bookMap[br.book_id] || {};
      const borrowDate = br.borrow_date ? new Date(br.borrow_date) : null;
      const dueDate = br.due_date ? new Date(br.due_date) : null;
      const returnDate = br.return_date ? new Date(br.return_date) : null;
      let status;
      if (!returnDate) {
        if (dueDate && dueDate < now) status = "overdue";
        else status = "checked-out";
      } else {
        status = "returned";
      }
      // Calculate fine: assume Rp 1,000 per day late
      let fine = 0;
      if (status === "overdue") {
        const daysLate = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        fine = daysLate > 0 ? daysLate * 1000 : 0;
      } else if (status === "returned" && returnDate && dueDate && returnDate > dueDate) {
        const daysLate = Math.floor((returnDate - dueDate) / (1000 * 60 * 60 * 24));
        fine = daysLate > 0 ? daysLate * 1000 : 0;
      }
      return {
        id: br.id,
        bookId: br.book_id,
        title: book.title || br.book_id,
        author: book.author || "",
        coverUrl: book.cover_image || "",
        borrowDate: borrowDate ? borrowDate.toLocaleDateString() : "-",
        dueDate: dueDate ? dueDate.toLocaleDateString() : "-",
        returnDate: returnDate ? returnDate.toLocaleDateString() : "-",
        status,
        fine,
      };
    });
  }, [history, bookMap]);

  // Filter by search, status, and time period
  const filtered = useMemo(() => {
    let list = enriched;
    
    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      if (timeFilter === "1month") {
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      } else if (timeFilter === "3months") {
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
      }
      list = list.filter((item) => {
        const bDate = item.borrowDate ? new Date(item.borrowDate) : null;
        return bDate && bDate >= cutoffDate;
      });
    }
    
    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(s) ||
          (item.author || "").toLowerCase().includes(s) ||
          String(item.bookId || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [enriched, searchQuery, statusFilter, timeFilter]);

  // Stats: total borrowed, active/overdue count, unpaid fines
  const totalBorrowed = enriched.length;
  const activeCount = enriched.filter((item) => item.status === "checked-out" || item.status === "overdue").length;
  const unpaidFines = enriched
    .filter((item) => item.status === "overdue")
    .reduce((sum, item) => sum + item.fine, 0);

  // Determine status badge styling
  function getStatusBadge(status) {
    const badges = {
      "overdue": { label: "Overdue", className: "status-overdue" },
      "returned": { label: "Returned", className: "status-returned" },
      "checked-out": { label: "Checked Out", className: "status-checked-out" },
    };
    return badges[status] || badges["returned"];
  }

  // Return book from history
  async function returnBook(borrowingId) {
    try {
      await BorrowAPI.returnBook(borrowingId);
      toast.push("Book returned", "success");
      // refresh history: remove returned borrowing or mark as returned
      setHistory((prev) =>
        prev.map((br) =>
          br.id === borrowingId ? { ...br, return_date: new Date().toISOString().substring(0, 10) } : br
        )
      );
    } catch (e) {
      toast.push(normalizeError(e), "error");
    }
  }

  return (
    <>
      <div className="history-container">
        {/* Header with title and export */}
        <div className="history-header">
          <div className="header-content">
            <h1>My Borrowing History</h1>
            <p className="header-subtitle">
              Review your past and current borrowings, track due dates and fines.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon stat-icon-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </span>
              <p className="stat-label">Total Borrowed</p>
            </div>
            <p className="stat-value">{totalBorrowed}</p>
            <p className="stat-meta">All time history</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon stat-icon-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-6l-2 3h-4l-2-3H2"></path>
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </span>
              <p className="stat-label">Active Loans</p>
            </div>
            <p className="stat-value">{activeCount}</p>
            <p className="stat-meta">Currently borrowed</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon stat-icon-red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </span>
              <p className="stat-label">Unpaid Fines</p>
            </div>
            <p className="stat-value stat-value-red">
              Rp {unpaidFines.toLocaleString()}
            </p>
            <p className="stat-meta">
              {unpaidFines > 0 ? "Overdue returns" : "No outstanding fines"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-toolbar">
          <div className="search-box">
            <span className="search-icon"></span>
            <input
              type="text"
              placeholder="Search by Title, Author, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              className="date-picker"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="1month">Last 1 Month</option>
              <option value="3months">Last 3 Months</option>
            </select>
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="checked-out">Checked Out</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <div>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="invEmpty">No records found.</div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th className="col-cover">Cover</th>
                  <th className="col-details">Book Name</th>
                  <th className="col-date">Borrowed</th>
                  <th className="col-date">Due Date</th>
                  <th className="col-date">Returned</th>
                  <th className="col-status">Status</th>
                  <th className="col-fee">Fine</th>
                  <th className="col-actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div
                          className="book-cover"
                          style={{ backgroundImage: item.coverUrl ? `url(${item.coverUrl})` : undefined }}
                        />
                      </td>
                      <td>
                        <div className="book-info">
                          <span className="book-title">{item.title}</span>
                          <span className="book-author">{item.author}</span>
                        </div>
                      </td>
                      <td className="text-date">{item.borrowDate}</td>
                      <td className="text-date">{item.dueDate}</td>
                      <td className="text-date">{item.returnDate || "-"}</td>
                      <td>
                        <span className={`status-badge ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="text-fee">
                        {item.fine > 0 ? (
                          <span className="fee-unpaid">Rp {item.fine.toLocaleString()}</span>
                        ) : (
                          <span className="fee-none">-</span>
                        )}
                      </td>
                      <td>
                        {item.status !== "returned" && (
                          <button className="btn-return-history" onClick={() => returnBook(item.id)}>
                            ↩️ Return
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="pagination">
          <p className="pagination-info">
            Showing <span className="info-highlight">{filtered.length > 0 ? 1 : 0}</span> to
            <span className="info-highlight"> {filtered.length}</span> of
            <span className="info-highlight"> {filtered.length}</span> results
          </p>
          <div className="pagination-buttons">
            <button className="btn-pagination" disabled>
              <span>‹</span> Previous
            </button>
            <button className="btn-pagination btn-pagination-next" disabled>
              Next <span>›</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryBorrow;