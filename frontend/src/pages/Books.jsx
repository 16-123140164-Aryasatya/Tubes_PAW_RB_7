import React, { useEffect, useState } from "react";
import API from "../api/api";
import BookCard from "../components/BookCard";
import "../styles.css";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/api/books")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setBooks(res.data);
        } else if (Array.isArray(res.data.books)) {
          setBooks(res.data.books);
        } else if (Array.isArray(res.data.data)) {
          setBooks(res.data.data);
        } else {
          console.warn("Unexpected books format:", res.data);
          setBooks([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setBooks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="page">
        <div className="loading">📚 Loading books...</div>
      </div>
    );

  return (
    <div className="page">
      <h2 className="page-title">📚 Library Book Collection</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <p className="no-data">No books found.</p>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
