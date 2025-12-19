import React, { useMemo, useState } from "react";
import { useLibrary } from "../store/LibraryStore";

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

function TxRow({ title, author, id, borrower, due, status, statusTone, coverTone }) {
  return (
    <div className="txRow">
      <div className="txBook">
        <div className={`bookCover cover-${coverTone}`} />
        <div>
          <div className="txTitle">{title}</div>
          <div className="txSub">
            {author} <span className="dot">•</span> ID: #{id}
          </div>
        </div>
      </div>
      <div className="txCell">
        <div className="who">
          <div className="whoAvatar">👤</div>
          <div className="whoName">{borrower}</div>
        </div>
      </div>
      <div className="txCell">{due}</div>
      <div className="txCell">
        <span className={`pill pill-${statusTone}`}>{status}</span>
      </div>
      <div className="txCell txAction">⋮</div>
    </div>
  );
}

function BorrowCard({ name, role, time, book, meta, onApprove, onDeny }) {
  return (
    <div className="borrowCard">
      <div className="borrowHead">
        <div className="borrowUser">
          <div className="photo">🧑</div>
          <div>
            <div className="borrowName">{name}</div>
            <div className="borrowTime">{time}</div>
          </div>
        </div>
        <span className="roleTag">{role}</span>
      </div>

      <div className="borrowBody">
        <div className="bookThumb" />
        <div>
          <div className="borrowBook">{book}</div>
          <div className="borrowMeta">{meta}</div>
        </div>
      </div>

      <div className="borrowActions">
        <button className="btnSoft btnSoft-green" onClick={onApprove}>✓ Approve</button>
        <button className="btnSoft btnSoft-red" onClick={onDeny}>Deny</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { books, transactions, requests, stats, approveRequest, denyRequest } = useLibrary();

  // The dashboard no longer provides an inline "Add Book" or "Scan ISBN"
  // feature.  Book creation and management are handled via the
  // dedicated Manage Books page.  Therefore state and handlers for the
  // modal have been removed.

  const txView = useMemo(() => {
    return transactions.slice(0, 3).map((t) => {
      const b = books.find((x) => x.id === t.bookId);
      const title = b?.title ?? t.bookId;
      const author = b?.author ?? "Unknown";
      const id = (t.bookId || "").replace("B", "") || "0000";
      const statusTone = t.status === "Overdue" ? "red" : t.status === "Pending" ? "yellow" : "green";
      const coverTone = t.status === "Overdue" ? "teal" : t.status === "Pending" ? "yellow" : "blue";
      return { title, author, id, borrower: t.borrower, due: t.due, status: t.status, statusTone, coverTone };
    });
  }, [transactions, books]);

  return (
    <div className="dashWrap">
      {/* Hero section without actions; book management is handled via Manage Books page */}
      <div className="hero">
        <div>
          <div className="heroDate">Librarian Console</div>
          <div className="heroTitle">Manage Library Operations</div>
        </div>
      </div>

      <div className="statsGrid">
        <StatCard title="Total Books (Stock)" value={String(stats.totalBooks)} delta="+12%" deltaTone="green" />
        <StatCard
          title="Books Issued"
          value={String(stats.issued)}
          delta="+5%"
          deltaTone="green"
          extra={<div className="miniProgress"><div className="miniProgressFill" /></div>}
        />
        <StatCard
          title="Overdue Returns"
          value={String(stats.overdue)}
          delta="+2%"
          deltaTone="red"
          extra={<div className="warnText">Requires Attention</div>}
        />
        <StatCard
          title="Active Members"
          value={String(stats.members)}
          delta="+8%"
          deltaTone="green"
          extra={
            <div className="miniAvatars">
              <span className="miniA" />
              <span className="miniA" />
              <span className="miniA" />
              <span className="miniMore">+4</span>
            </div>
          }
        />
      </div>

      <div className="mainGrid">
        <div className="panel">
          <div className="panelHead">
            <div className="panelTitle">Recent Transactions</div>
            <div className="tabs">
              <button className="tab active" onClick={() => alert("Filter All (mock)")}>All</button>
              <button className="tab" onClick={() => alert("Filter Loans (mock)")}>Loans</button>
              <button className="tab" onClick={() => alert("Filter Returns (mock)")}>Returns</button>
            </div>
          </div>

          <div className="table">
            <div className="txHead">
              <div>Book Details</div>
              <div>Borrower</div>
              <div>Due Date</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {txView.map((t, idx) => (
              <TxRow key={idx} {...t} />
            ))}

            <div className="viewAll" onClick={() => alert("View all (mock)")}>
              View All Transactions →
            </div>
          </div>
        </div>

        <div className="rightCol">
          <div className="panel">
            <div className="panelHead">
              <div className="panelTitle">Borrow Requests</div>
              <div className="chip chip-blue">{requests.length} New</div>
            </div>

            <div className="borrowList">
              {requests.map((r) => {
                const b = books.find((x) => x.id === r.bookId);
                const meta = `${b?.category ?? "General"} • ${b?.stock > 0 ? "In Stock" : "Out of Stock"}`;
                return (
                  <BorrowCard
                    key={r.id}
                    name={r.name}
                    role={r.role}
                    time={r.time}
                    book={b?.title ?? r.bookId}
                    meta={meta}
                    onApprove={() => approveRequest(r.id)}
                    onDeny={() => denyRequest(r.id)}
                  />
                );
              })}
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
