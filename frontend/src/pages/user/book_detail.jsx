import React, { useEffect, useState } from "react";
import BookCover from "../../components/BookCover";
import { useParams, useNavigate } from "react-router-dom";
import "./book_detail.css";
import { BooksAPI, BorrowAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../auth/AuthContext";
import Loading from "../../components/Loading";

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
  const [borrowing, setBorrowing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showLoading, setShowLoading] = useState(false);

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
      setBorrowing(true);
      setShowLoading(true);
      setModalMessage("Permintaan peminjaman sedang diproses...");
      setShowModal(true);
      await BorrowAPI.request({ book_id: id });
      setModalMessage("✓ Permintaan peminjaman dikirim!\nMenunggu persetujuan librarian");
      setTimeout(() => {
        setShowModal(false);
        setShowLoading(false);
        // Navigate back to borrow page
        navigate("/user/borrow");
      }, 2000);
    } catch (e) {
      setModalMessage(`✗ Gagal: ${normalizeError(e)}`);
      setTimeout(() => {
        setShowModal(false);
        setShowLoading(false);
      }, 3000);
      toast.push(normalizeError(e), "error");
    } finally {
      setBorrowing(false);
    }
  }

  return (
    <div className="book-detail-container">
      {showLoading && <Loading label="Memproses permintaan peminjaman..." fullScreen />}
      
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
              <BookCover src={book.cover_image} size="lg" style={{ width: '100%', height: '100%' }} />
              <div className="status-badge-overlay">
                <span className={`status-badge ${ (book.copies_available ?? book.stock ?? book.quantity ?? 0) > 0 ? 'status-available' : 'status-waitlist' }`}>
                  <span className="status-dot"></span>
                  {(book.copies_available ?? book.stock ?? book.quantity ?? 0) > 0 ? 'Available' : 'Waitlist'}
                </span>
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="btn-borrow-now"
                onClick={borrowNow}
                disabled={borrowing || (book.copies_available ?? book.stock ?? book.quantity ?? 0) <= 0}
                style={{
                  opacity: borrowing ? 0.7 : 1,
                  cursor: borrowing ? 'wait' : 'pointer'
                }}
              >
                {borrowing ? "⏳ Memproses..." : "Borrow Now"}
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

      {/* Modal Notification */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px 30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 9999,
            maxWidth: "400px",
            textAlign: "center",
            whiteSpace: "pre-line",
          }}
        >
          ⏳ {modalMessage}
        </div>
      )}
    </div>
  );
};

export default BookDetail;