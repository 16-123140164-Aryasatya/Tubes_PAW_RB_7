import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./book_detail.css";
import { BooksAPI, BorrowAPI } from "../src/api/endpoints";
import { normalizeError } from "../src/api/client";
import { useToast } from "../src/components/Toast";
import { useAuth } from "../src/auth/AuthContext";

/**
 * BookDetail displays detailed information for a single book and
 * allows the user to borrow it.  Data is fetched from the backend
 * via /api/books/{id}.  When borrowed successfully the user is
 * redirected back to the catalog.
 */
const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await BooksAPI.detail(id);
        const data = res.data?.data || res.data?.book || res.data;
        if (alive) setBook(data);
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
  }, [id]);

  // Borrow the book
  async function borrowNow() {
    try {
      await BorrowAPI.request({ book_id: id });
      toast.push("Book borrowed successfully", "success");
      // Navigate back to borrow page
      navigate("/user/borrow");
    } catch (e) {
      toast.push(normalizeError(e), "error");
    }
  }

  return (
    <div className="book-detail-container">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <span className="breadcrumb-link" onClick={() => navigate('/user/dashboard')}>Home</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-link" onClick={() => navigate('/user/catalog')}>Catalog</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Details</span>
      </nav>
      {loading ? (
        <div>Loading...</div>
      ) : !book ? (
        <div>Book not found.</div>
      ) : (
        <div className="book-detail-grid">
          {/* Left: Cover and actions */}
          <div className="book-showcase">
            <div className="book-cover-large">
              {book.cover_image ? (
                <img src={book.cover_image} alt={`Cover of ${book.title}`} className="book-cover-image" />
              ) : (
                <div className="book-cover-placeholder" />
              )}
              <div className="status-badge-overlay">
                <span className={`status-badge ${ (book.copies_available ?? book.stock ?? book.quantity ?? 0) > 0 ? 'status-available' : 'status-waitlist' }`}>
                  <span className="status-dot"></span>
                  {(book.copies_available ?? book.stock ?? book.quantity ?? 0) > 0 ? 'Available' : 'Waitlist'}
                </span>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn-borrow-now" onClick={borrowNow} disabled={(book.copies_available ?? book.stock ?? book.quantity ?? 0) <= 0}>
                <span className="btn-icon">📖</span>
                Borrow Now
              </button>
              <button className="btn-wishlist" disabled>
                <span className="btn-icon">🔖</span>
                Add to Wishlist
              </button>
            </div>
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Copies</span>
                <span className="stat-value">{book.copies_available ?? book.stock ?? book.quantity ?? '-'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Category</span>
                <span className="stat-value">{book.category || '-'}</span>
              </div>
            </div>
          </div>
          {/* Right: Details */}
          <div className="book-content">
            <div className="book-header">
              <div className="book-categories">
                {book.category && <span className="category-chip category-primary">{book.category}</span>}
              </div>
              <h1 className="book-title">{book.title}</h1>
              <div className="book-author">
                <span className="author-label">by</span>
                <span className="author-link">{book.author || '-'}</span>
              </div>
            </div>
            <div className="tab-content">
              <div className="book-description">
                <p>{book.description || 'No description provided.'}</p>
              </div>
              <div className="book-metadata">
                <div className="meta-item">
                  <span className="meta-label">Year</span>
                  <span className="meta-value">{book.year || '-'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">ISBN</span>
                  <span className="meta-value">{book.isbn || book.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Category</span>
                  <span className="meta-value">{book.category || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;