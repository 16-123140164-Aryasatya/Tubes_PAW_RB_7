import React, { useMemo, useState } from "react";
import { useLibrary } from "../../store/LibraryStore";

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
          <span className="invSearchIcon">🔎</span>
          <input
            className="invSearchInput"
            placeholder="Search by title, author, category, or ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="panel">
        <div className="invTable">
          <div className="invThead">
            <div>Book</div>
            <div>Category</div>
            <div>Stock</div>
            <div>Status</div>
          </div>

          {filtered.map((b) => {
            const status = b.stock > 2 ? "Available" : b.stock > 0 ? "Low Stock" : "Out of Stock";
            const tone = b.stock > 2 ? "green" : b.stock > 0 ? "yellow" : "red";
            return (
              <div className="invRow" key={b.id}>
                <div className="invBook">
                  <div className="invCover" />
                  <div>
                    <div className="invBookTitle">{b.title}</div>
                    <div className="invBookSub">{b.author} • ID: {b.id}</div>
                  </div>
                </div>
                <div className="invCell">{b.category}</div>
                <div className="invCell">{b.stock}</div>
                <div className="invCell"><span className={`pill pill-${tone}`}>{status}</span></div>
              </div>
            );
          })}

          {filtered.length === 0 && <div className="invEmpty">No books found.</div>}
        </div>
      </div>
    </div>
  );
}
