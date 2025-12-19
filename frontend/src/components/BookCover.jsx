import React from "react";
import "./BookCover.css";

export default function BookCover({ src, alt = "Book cover", size = "md", style = {}, className = "" }) {
  const sizes = {
    xs: { width: 40, height: 56, radius: 4 },
    sm: { width: 48, height: 68, radius: 8 },
    md: { width: 80, height: 120, radius: 10 },
    lg: { width: "100%", height: 420, radius: 14 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`book-cover-root ${className}`}
      style={{ width: s.width, height: s.height, borderRadius: s.radius, ...style }}
    >
      {src ? (
        <img className="book-cover-image" src={src} alt={alt} loading="lazy" />
      ) : null}
    </div>
  );
}
