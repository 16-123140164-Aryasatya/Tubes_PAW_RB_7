import React from "react";
import { useLibrary } from "../../store/LibraryStore";
import "./BorrowRequests.css";

export default function BorrowRequests() {
  const { requests, books, approveRequest, denyRequest } = useLibrary();

  return (
    <div className="panel">
      <div className="panelHead">
        <div className="panelTitle">Borrow Requests</div>
        <div className="chip chip-blue">{requests.length} Pending</div>
      </div>

      <div className="borrowList">
        {requests.map((r) => {
          const b = books.find((x) => x.id === r.bookId);
          const meta = `${b?.category ?? "General"} • ${b?.stock > 0 ? "In Stock" : "Out of Stock"}`;

          return (
            <div className="borrowCard" key={r.id}>
              <div className="borrowHead">
                <div className="borrowUser">
                  <div className="photo">🧑</div>
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
                  ✓ Approve
                </button>
                <button className="btnSoft btnSoft-red" onClick={() => denyRequest(r.id)}>
                  Deny
                </button>
              </div>
            </div>
          );
        })}

        {requests.length === 0 && <div className="invEmpty">No pending requests.</div>}
      </div>
    </div>
  );
}
