import React, { useState } from "react";
import "./catalog.css";

const booksData = [
  {
    id: 1,
    title: "The Design of Everyday Things",
    author: "Don Norman",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGglF0uFk3qPZjxmT11M8MJb4r0fqqKt9cClQbo7idkNlz9s7-9j2UQ1FhxxJJu-1I8xxhKSF0hJw1C7Cl5Vq5BszyYstFeHNRGqO9jliweik63S3c5BoNbkXWYs2-HqkDngnuRnHam_5NyDOF7nAnf-RahVCewuB6rGomLt5JGW-sEWe5rOEe3Q2yWlJtge_phSbYh-x7JX_66qpWTe4Moh0pIriPc4bnu39KRfGXnNXMgxgHze4DQNDzxbUaXmvYhkk0ipSvWV0x",
    rating: 4,
    reviews: 128,
    status: "available",
    category: "Technology"
  },
  {
    id: 2,
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBr29wZkQUlx8kTJ-xPdzwxRKNq2yQ9ODe9dRyKLTAnQIq0vctSCGFX6RUd5gzqfY8H25OnHGIU5Gngckfz9xzMZFabcGj_y89and3S2FcyvD-y0PaIDYTXPRTr-Wjc6lplgC0OT8otk26kP4i4OmV0Dsc0DQo0yDjsFiDtyG8Hjsf2AF1Iy14HNfp9LjsMqFnayozNVx__5SpbMJMwDJAYrbTR8iFBxaCAIQVTyQVjuNAFIy8LEpE36SlY_Z7qJerOCXY5NtzC3-U0",
    rating: 5,
    reviews: 342,
    status: "waitlist",
    category: "Science"
  },
  {
    id: 3,
    title: "Deep Work",
    author: "Cal Newport",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBc8NLHFw-E_mp__gQnvtOo-Zz2NxNmv0m4Kondzf2cogRwBw6U9B343z5EHU5kKtUd_QHTifSafasl31qXqyEv0HitUsgxoT8BYrNfBbu0f_xSqiSqInaFR9vknrdJiEPymbvXwf9ebJmgCgTAytPOwh1OyIO_Yqr_PNPeCO8W2rCFzuv3J4GjgTn0bxa_R-3ZhevMhrYupxpkgkpJJ96ATHrWCwAokVPlGMoi1hg5c5pin-VIerLjBbtRShLltIBHGMvvYYErDWT3",
    rating: 4.5,
    reviews: 89,
    status: "available",
    category: "Technology"
  },
  {
    id: 4,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAElzYPV8V8kkic1_QCHHAR-sCpSUuuctCz6kmmC56-4ixmnWJ1cP8rKTisrGfeKR8r-RuqXanq_nXfiCdyFNSTEZXpe7R6vXlHjpoJ8pPTjBD5D3gNrAC7tCSrXsnTYZL0vnERTatrRGJxK5OoPeAuO727MFjHYEY7uoXxuqtFnRDtecE4RaT9ZBGwyXY_GZHO2U8FluCKY1Ea0S2qpi0H2R2bYRU37uToTtKIdU2ilBaqFuSnFRXVMHkG1u4wPV8thWrBFukBxEDV",
    rating: 5,
    reviews: 1204,
    status: "checked-out",
    dueDate: "3 days",
    category: "Fiction"
  },
  {
    id: 5,
    title: "The Martian",
    author: "Andy Weir",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2vLYoYmDrngDdEJqmFELRU2ROwD_1BpuD0y-TZtKLJmq3k1z40Ilz0VcJ8zacFT1ohYxGDLYKZ6qukI01m7OTZrZON9l_jEgsBMprzfCmiiM0wgmAS3m-Zz5q-_5CAA_C7gTpa_WSh1eJIOASItbGDACPZW6gwlTTCpE6ntmL_1Lg8OgQUiYD7b9jZkIOesDH9gbcQYzYI65pmEQU0aXiFCRrvGc9VhHH4RxyDbN35M23-I3Z5F3KB8_SiDcwrdY-9pLzZUNkITWl",
    rating: 4,
    reviews: 512,
    status: "available",
    category: "Science"
  },
  {
    id: 6,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGRlaW0AmrFubKHD7hFeNsrpNr5MrtmFczzb1CfbIn5fxpHOKACK3v9m8Ir0dfXWWa8ptT0fnVMPWm_2al2zfomxM6dxjH19ZOfKqePinPuooSKcMeLcL1GWzV3f4J2RyLG0a434H97C1iGh4SR_1TslvbFcKsLcdO-2h010gy3BaTkUl7X_iQ-6EHdIdfr6lzVdZrXTMY9G5btQZf2shaTNqbBpsCEkvIp1lPwYi9TZaRLyQlMrTakEoI3k7T_beoh6DqUAfzjBxr",
    rating: 5,
    reviews: 999,
    status: "available",
    category: "Fiction"
  },
  {
    id: 7,
    title: "Clean Code",
    author: "Robert C. Martin",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOuILx2ZRonlaH11FLNt-SPYr1NYxhhK8BVT0WDg92SVLB18kjYNRjNWoPz3mx2y0zzC-Og4vxQWdT2woZQ-VMm5WUhkJwe0qrQyBpk4230P5MAo2Cdsu-EmSzlK3DuA2-D4s_XCS2exX1aaqucofSUFroup838toYgPcf0H6HG2uq6Pv5FgPCaWmvO2NIiYNMxEF0Z_0kkusddnA-eNfa-5sN5311cUz6UwmR4yHGKmhFSH_Vw1qk1wejABLNybUA6yhM33u_wSJU",
    rating: 4.5,
    reviews: 412,
    status: "available",
    category: "Technology"
  },
  {
    id: 8,
    title: "Neuromancer",
    author: "William Gibson",
    cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2RRB95wD0RrD36Bsp2UuJK_JUT4WufuhPYeY72VxAVb_yc71tuY5nUB5-eq3vqEL5onD3t8sbgKNvouQeUGGSBGvLliCviLdbHZ8QnuQ9jHs8S2Dh1_Kj0UFrJzLcADV-LWksEiggIktXg5GKahIdFx96nB7TBiAgVYLjlTuQw6FXOl7N7-zIv926D-ktwe9zPcxVE56LsVb0wE5AFXzVZ3cXTnuKRJJWyJilMkOvS2mxCisgwbMdM1xSF8XpMV7rJKyZQAk3dgQA",
    rating: 4,
    reviews: 210,
    status: "waitlist",
    category: "Fiction"
  }
];

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return { label: "Available", className: "status-available" };
      case "waitlist":
        return { label: "Waitlist", className: "status-waitlist" };
      case "checked-out":
        return { label: "Checked Out", className: "status-checked-out" };
      default:
        return { label: status, className: "" };
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="star-icon filled">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star-icon half">
          ★
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star-icon empty">
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <>
      <div className="catalog-container">
        {/* Hero & Search */}
        <div className="catalog-hero">
          <div className="hero-content">
            <h2 className="hero-title">Explore Our Collection</h2>
            <p className="hero-subtitle">
              Find your next favorite read from thousands of titles available instantly.
            </p>
          </div>
          <div className="search-wrapper">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">Search</button>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="catalog-filters">
          <div className="filter-chips">
            <div className="filter-label">
              <span className="filter-icon">⚙️</span>
              <span>Filters:</span>
            </div>
            <button
              className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
              <span className="dropdown-icon">▼</span>
            </button>
            <button
              className={`filter-chip ${selectedCategory === "fiction" ? "active" : ""}`}
              onClick={() => setSelectedCategory("fiction")}
            >
              Fiction
            </button>
            <button
              className={`filter-chip ${selectedCategory === "science" ? "active" : ""}`}
              onClick={() => setSelectedCategory("science")}
            >
              Science
            </button>
            <button
              className={`filter-chip ${selectedCategory === "history" ? "active" : ""}`}
              onClick={() => setSelectedCategory("history")}
            >
              History
            </button>
            <button
              className={`filter-chip ${selectedCategory === "technology" ? "active" : ""}`}
              onClick={() => setSelectedCategory("technology")}
            >
              Technology
            </button>
          </div>

          <div className="filter-controls">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
              />
              <span>Available Only</span>
            </label>
            <div className="divider"></div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Sort by: Popular</option>
              <option value="newest">Sort by: Newest</option>
              <option value="title">Sort by: Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Book Grid */}
        <div className="books-grid">
          {booksData.map((book) => {
            const statusBadge = getStatusBadge(book.status);
            return (
              <article key={book.id} className="book-card">
                <div className="book-cover-wrapper">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="book-cover"
                  />
                  <div className="status-badge-wrapper">
                    <span className={`status-badge ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
                <div className="book-details">
                  <h3 className="book-title" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="book-author">{book.author}</p>
                  <div className="book-rating">
                    {renderStars(book.rating)}
                    <span className="review-count">({book.reviews})</span>
                  </div>
                  <div className="book-actions">
                    {book.status === "available" && (
                      <>
                        <button className="btn-borrow">Borrow</button>
                        <button className="btn-bookmark">🔖</button>
                      </>
                    )}
                    {book.status === "waitlist" && (
                      <>
                        <button className="btn-waitlist">Join Waitlist</button>
                        <button className="btn-bookmark">🔖</button>
                      </>
                    )}
                    {book.status === "checked-out" && (
                      <>
                        <button className="btn-due" disabled>
                          Due in {book.dueDate}
                        </button>
                        <button className="btn-notify">🔔</button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="pagination-wrapper">
          <div className="pagination-info">
            <p>
              Showing <span className="highlight">1</span> to{" "}
              <span className="highlight">8</span> of{" "}
              <span className="highlight">128</span> results
            </p>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn" onClick={() => setCurrentPage(2)}>
              2
            </button>
            <button className="pagination-btn" onClick={() => setCurrentPage(3)}>
              3
            </button>
            <span className="pagination-dots">...</span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Catalog;
