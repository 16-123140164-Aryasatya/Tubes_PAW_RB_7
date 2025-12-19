import React, { useMemo, useState } from "react";
import { useLibrary } from "../../store/LibraryStore";
import BookCover from "../../components/BookCover";
import "./Inventory.css";

export default function Inventory() {
  const { books } = useLibrary();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return books;
    return books.filter((b) => {
      const idStr = String(b.id || "").toLowerCase();
      const title = (b.title || "").toLowerCase();
      const author = (b.author || "").toLowerCase();
      const category = (b.category || "").toLowerCase();
      return (
        idStr.includes(s) ||
        title.includes(s) ||
        author.includes(s) ||
        category.includes(s)
      );
    });
  }, [books, q]);

  return (
    <div className="inv">
      <div className="invHead">
        <div className="invTitle">Inventory</div>
        <div className="invSearch">
          <span className="invSearchIcon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </span>
          <input
            className="invSearchInput"
            placeholder="Search by title, author, category, or ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="invGrid">
        {filtered.map((b, idx) => {
          const status = b.stock > 2 ? "Available" : b.stock > 0 ? "Low Stock" : "Out of Stock";
          const tone = b.stock > 2 ? "green" : b.stock > 0 ? "yellow" : "red";
          const colors = ["blue", "teal", "purple", "orange"];
          const coverColor = colors[idx % colors.length];

          return (
            <div className="invCard" key={b.id}>
              <BookCover src={b.image_url || b.cover_image} size="md" />
              <div className="invInfo">
                <div className="invBookTitle">{b.title}</div>
                <div className="invBookSub">{b.author} • ID: #{String(b.id).replace("B", "")}</div>
                <div className="invMeta">
                  <span className="invBadge invBadge-blue">{b.category || "General"}</span>
                  <span className="invBadge invBadge-gray">Stock: {b.stock}</span>
                  <span className={`invBadge invBadge-${tone}`}>{status}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && <div className="invEmpty">No books found.</div>}
      </div>
    </div>
  );
}
