import React, { useState } from "react";
import BookCover from "../../components/BookCover";
import { useLibrary } from "../../store/LibraryStore";
import "./Dashboard.css";

function StatCard({ title, value, delta, deltaTone = "green", extra }) {
  return (
    <div className="statCard">
      <div className="statTop">
        <div className="statTitle">{title}</div>
        <div className={`chip chip-${deltaTone}`}>{delta}</div>
      </div>
      <div className="statValue">{value}</div>
      {extra && <div className="statExtra">{extra}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { books, transactions, requests, returnRequests, stats, addBook, approveRequest, denyRequest, approveReturn, denyReturn } = useLibrary();

  const [open, setOpen] = useState(false);
  const [requestTab, setRequestTab] = useState("borrow"); // "borrow" atau "return"
  const [form, setForm] = useState({ title: "", author: "", category: "", stock: "1" });

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function submit() {
    if (!form.title.trim() || !form.author.trim()) return alert("Title & Author wajib diisi");
    const st = Number(form.stock);
    if (Number.isNaN(st) || st < 0) return alert("Stock harus angka >= 0");
    addBook(form);
    setOpen(false);
    setForm({ title: "", author: "", category: "", stock: "1" });
  }

  return (
    <div className="dashWrap">
      <div className="hero">
        <div>
          <div className="heroDate">Librarian Console</div>
          <div className="heroTitle">Manage Library Operations</div>
        </div>
        <div className="heroBtns">
          <button className="btnPrimary" onClick={() => setOpen(true)}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Book
          </button>
        </div>
      </div>

      {open && (
        <div className="mBackdrop" onMouseDown={() => setOpen(false)}>
          <div className="mModal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mHead">
              <div className="mTitle">Add New Book</div>
              <button className="mClose" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="mBody">
              <label className="mLabel">Title</label>
              <input className="mInput" value={form.title} onChange={(e) => setField("title", e.target.value)} />
              <label className="mLabel">Author</label>
              <input className="mInput" value={form.author} onChange={(e) => setField("author", e.target.value)} />
              <label className="mLabel">Category</label>
              <input className="mInput" value={form.category} onChange={(e) => setField("category", e.target.value)} />
              <label className="mLabel">Stock</label>
              <input className="mInput" value={form.stock} onChange={(e) => setField("stock", e.target.value)} />
              <div className="mActions">
                <button className="btnGhost2" onClick={() => setOpen(false)}>Cancel</button>
                <button className="btnPrimary" onClick={submit}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="statsGrid">
        <StatCard title="Total Books (Stock)" value={String(stats.totalBooks)} delta="+12%" deltaTone="green" />
        <StatCard title="Books Issued" value={String(stats.issued)} delta="+5%" deltaTone="green" />
        <StatCard title="Overdue Returns" value={String(stats.overdue)} delta="+2%" deltaTone="red" extra={<div className="warnText">Requires Attention</div>} />
      </div>

      <div className="mainGrid">
        <div className="panel">
          <div className="panelHead">
            <div className="panelTitle">Recent Transactions</div>
          </div>

          <div className="table">
            <div className="txHead">
              <div>Book Details</div>
              <div>Borrower</div>
              <div>Due Date</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {transactions.slice(0, 3).map((t) => {
              const b = books.find((x) => x.id === t.bookId);
              const title = b?.title ?? t.bookId;
              const author = b?.author ?? "Unknown";
              const id = String(t.bookId || "0000").replace("B", "");
              const dueStr = t.due ? new Date(t.due).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "-";
              const statusTone = t.status === "Overdue" ? "red" : t.status === "Pending" ? "yellow" : "green";
              const coverTone = t.status === "Overdue" ? "teal" : t.status === "Pending" ? "yellow" : "blue";

              return (
                <div className="txRow" key={t.id}>
                  <div className="txBook">
                    <BookCover size="xs" />
                    <div>
                      <div className="txTitle">{title}</div>
                      <div className="txSub">{author} <span className="dot">•</span> ID: #{id}</div>
                    </div>
                  </div>
                  <div className="txCell">{t.borrower}</div>
                  <div className="txCell">{dueStr}</div>
                  <div className="txCell"><span className={`pill pill-${statusTone}`}>{t.status}</span></div>
                  <div className="txCell txAction">⋮</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rightCol">
          <div className="panel">
            <div className="panelHead">
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div className="panelTitle">Requests</div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className={`chip ${requestTab === "borrow" ? "chip-blue" : "chip-gray"}`}
                  onClick={() => setRequestTab("borrow")}
                  style={{ cursor: "pointer", padding: "6px 12px", fontSize: "12px" }}
                >
                  Borrow ({requests.length})
                </button>
                <button
                  className={`chip ${requestTab === "return" ? "chip-blue" : "chip-gray"}`}
                  onClick={() => setRequestTab("return")}
                  style={{ cursor: "pointer", padding: "6px 12px", fontSize: "12px" }}
                >
                  Return ({returnRequests.length})
                </button>
              </div>
            </div>

            <div className="borrowList">
              {requestTab === "borrow" ? (
                requests.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>No borrow requests</div>
                ) : (
                  requests.map((r) => {
                    const b = books.find((x) => x.id === r.bookId);
                    const meta = `${b?.category ?? "General"} • ${b?.stock > 0 ? "In Stock" : "Out of Stock"}`;
                    return (
                      <div className="borrowCard" key={r.id}>
                        <div className="borrowHead">
                          <div className="borrowUser">
                            <div className="photo">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                            <div>
                              <div className="borrowName">{r.name}</div>
                              <div className="borrowTime">{r.time}</div>
                            </div>
                          </div>
                          <span className="roleTag">{r.role}</span>
                        </div>

                        <div className="borrowBody">
                          <div className="bookThumb" />
                          <div>
                            <div className="borrowBook">{b?.title ?? r.bookId}</div>
                            <div className="borrowMeta">{meta}</div>
                          </div>
                        </div>

                        <div className="borrowActions">
                          <button className="btnSoft btnSoft-green" onClick={() => approveRequest(r.id)}>
                            <svg className="btn-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Approve
                          </button>
                          <button className="btnSoft btnSoft-red" onClick={() => denyRequest(r.id)}>Deny</button>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                returnRequests.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>No return requests</div>
                ) : (
                  returnRequests.map((r) => {
                    const b = books.find((x) => x.id === r.bookId);
                    return (
                      <div className="borrowCard" key={r.id}>
                        <div className="borrowHead">
                          <div className="borrowUser">
                            <div className="photo">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                            <div>
                              <div className="borrowName">{r.name}</div>
                              <div className="borrowTime">{r.time}</div>
                            </div>
                          </div>
                          <span className="roleTag" style={{ backgroundColor: "#ff9500" }}>{r.role}</span>
                        </div>

                        <div className="borrowBody">
                          <div className="bookThumb" />
                          <div>
                            <div className="borrowBook">{b?.title ?? r.bookId}</div>
                            <div className="borrowMeta">Return request</div>
                          </div>
                        </div>

                        <div className="borrowActions">
                          <button className="btnSoft btnSoft-green" onClick={() => approveReturn(r.id)}>
                            <svg className="btn-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Approve
                          </button>
                          <button className="btnSoft btnSoft-red" onClick={() => denyReturn(r.id)}>Deny</button>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>

          <div className="statusBar">
            <span className="statusDot" />
            <span>SYSTEM STATUS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
