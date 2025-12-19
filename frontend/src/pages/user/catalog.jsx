import React, { useEffect, useMemo, useState } from "react";
import "./catalog.css";
// Import API helpers from the main src.  Because the ui_user folder lives
// outside of src, we reference them via a relative path.  These helpers
// wrap axios and point to the backend defined in .env.
import { BooksAPI, BorrowAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";

/**
 * Catalog page for members.  Fetches the list of books from the backend
 * and allows the user to search, filter by category, view availability
 * and borrow a book directly.  This replaces the static mock
 * implementation with real API calls.
 */
const Catalog = () => {
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch books on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await BooksAPI.list();
        const data = res.data?.data || res.data?.books || res.data || [];
        if (alive) setBooks(Array.isArray(data) ? data : []);
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

  // Derive filtered list based on search and filters
  const filtered = useMemo(() => {
    let list = books;
    if (selectedCategory !== "all") {
      list = list.filter((b) => (b.category || "").toLowerCase() === selectedCategory);
    }
    if (availableOnly) {
      list = list.filter((b) => (b.copies_available ?? b.stock ?? b.quantity ?? 0) > 0);
    }
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          (b.title || "").toLowerCase().includes(s) ||
          (b.author || "").toLowerCase().includes(s) ||
          String(b.id || b.isbn || "").toLowerCase().includes(s)
      );
    }
    return list;
  }, [books, selectedCategory, availableOnly, searchQuery]);

  // Derive a list of categories from the fetched books.  This allows
  // the filter chips to adapt to whatever categories exist in the
  // backend instead of showing a static list.  Categories are
  // normalised to lowercase for comparison.  The "all" category is
  // always present at the beginning of the array.
  const categories = useMemo(() => {
    const set = new Set();
    books.forEach((b) => {
      const cat = (b.category || "").toLowerCase().trim();
      if (cat) set.add(cat);
    });
    return ["all", ...Array.from(set).sort()];
  }, [books]);

  // Determine the availability badge for a book
  function getStatusBadge(book) {
    const avail = book.copies_available ?? book.stock ?? book.quantity ?? 0;
    return avail > 0
      ? { label: "Available", className: "status-available" }
      : { label: "Waitlist", className: "status-waitlist" };
  }

  // Borrow a book; calls backend and updates local state
  async function borrowBook(bookId) {
    try {
      await BorrowAPI.request({ book_id: bookId });
      toast.push("Book borrowed successfully", "success");
      // refresh the single book to get new availability
      const res = await BooksAPI.detail(bookId);
      const updated = res.data?.data || res.data?.book || res.data;
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (e) {
      toast.push(normalizeError(e), "error");
    }
  }

  // Render stars (dummy rating as backend doesn't provide rating).  The
  // UI design expects rating stars, so we show 4 by default.
  function renderStars(rating = 4) {
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    for (let i = 0; i < full; i++) stars.push(<span key={`f-${i}`} className="star-icon filled">★</span>);
    if (hasHalf) stars.push(<span key="half" className="star-icon half">★</span>);
    const empty = 5 - Math.ceil(rating);
    for (let i = 0; i < empty; i++) stars.push(<span key={`e-${i}`} className="star-icon empty">★</span>);
    return stars;
  }

  return (
    <div className="catalog-container">
      {/* Hero section with search */}
      <div className="catalog-hero">
        <div className="hero-content">
          <h2 className="hero-title">Explore Our Collection</h2>
          <p className="hero-subtitle">Discover books available in our library and borrow instantly.</p>
        </div>
        <div className="search-wrapper">
          <div className="search-box">
            {/* The search icon has been removed for a cleaner look */}
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="catalog-filters">
        <div className="filter-chips">
          {/* Label without emoji icon for filters */}
          <div className="filter-label">
            <span>Filters:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <button className="filter-chip" onClick={() => setAvailableOnly(!availableOnly)}>
            {availableOnly ? "Show All" : "Available Only"}
          </button>
        </div>
      </div>

      {/* Books grid */}
      <div className="catalog-grid">
        {loading ? (
          <div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div>No books found.</div>
        ) : (
          filtered.map((book) => {
            const badge = getStatusBadge(book);
            return (
              <div key={book.id} className="book-card">
                <div className="book-cover" style={{ backgroundImage: `url(${book.cover_image || ""})` }} />
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                  <div className="book-meta">
                    <span className="book-rating">{renderStars(4)}</span>
                  </div>
                  <span className={`status-badge ${badge.className}`}>{badge.label}</span>
                  {badge.label === "Available" && (
                    <button className="btn-primary" onClick={() => borrowBook(book.id)}>
                      Borrow
                    </button>
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

export default Catalog;