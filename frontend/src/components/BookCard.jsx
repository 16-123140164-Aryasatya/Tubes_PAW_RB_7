import React from "react";

export default function BookCard({ book }) {
  return (
    <div className="book-card">
      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="author">✍️ {book.author || "Unknown Author"}</p>
        <p className="category">
          📖 {book.category || "Uncategorized"}
        </p>
      </div>

      <div className="availability">
        {book.copies_available > 0 ? (
          <span className="available">Available: {book.copies_available}</span>
        ) : (
          <span className="unavailable">Not Available</span>
        )}
      </div>
    </div>
  );
}
