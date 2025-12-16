import React from "react";
import { useLibrary } from "../../store/LibraryStore";

export default function Transactions() {
  const { transactions, books } = useLibrary();

  return (
    <div className="panel">
      <div className="panelHead">
        <div className="panelTitle">Transactions</div>
      </div>

      <div className="table">
        <div className="txHead">
          <div>Book</div>
          <div>Borrower</div>
          <div>Due</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {transactions.map((t) => {
          const b = books.find((x) => x.id === t.bookId);
          const title = b?.title ?? t.bookId;
          const author = b?.author ?? "Unknown";
          const id = (t.bookId || "").replace("B", "") || "0000";

          const statusTone =
            t.status === "Overdue" ? "red" :
            t.status === "Pending" ? "yellow" :
            "green";

          const coverTone =
            t.status === "Overdue" ? "teal" :
            t.status === "Pending" ? "yellow" :
            "blue";

          return (
            <div className="txRow" key={t.id}>
              <div className="txBook">
                <div className={`bookCover cover-${coverTone}`} />
                <div>
                  <div className="txTitle">{title}</div>
                  <div className="txSub">{author} <span className="dot">•</span> ID: #{id}</div>
                </div>
              </div>
              <div className="txCell">{t.borrower}</div>
              <div className="txCell">{t.due}</div>
              <div className="txCell"><span className={`pill pill-${statusTone}`}>{t.status}</span></div>
              <div className="txCell txAction">⋮</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
