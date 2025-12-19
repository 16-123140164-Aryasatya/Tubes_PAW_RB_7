import React from "react";
import { useLibrary } from "../../store/LibraryStore";
import "./Transactions.css";

export default function Transactions() {
  // Pull transactions and helper actions from the library context
  const { transactions, books, returnBook, payFine } = useLibrary();

  return (
    <div className="transWrap">
      <div className="transHead">
        <div>
          <div className="transTitle">Transactions</div>
          <div className="transSub">Manage all book borrowing and return activities</div>
        </div>
        <div className="transStats">
          <div className="miniStat">
            <div className="miniVal">{transactions.filter(t => t.status === "Borrowed").length}</div>
            <div className="miniLabel">Active</div>
          </div>
          <div className="miniStat">
            <div className="miniVal">{transactions.filter(t => t.status === "Overdue").length}</div>
            <div className="miniLabel">Overdue</div>
          </div>
          <div className="miniStat">
            <div className="miniVal">{transactions.filter(t => t.status === "Returned").length}</div>
            <div className="miniLabel">Returned</div>
          </div>
        </div>
      </div>

      <div className="panel">
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
          const id = String(t.bookId || "0000").replace("B", "");

          // Determine status tone for pill and cover color
          const statusTone =
            t.status === "Overdue"
              ? "red"
              : t.status === "Pending"
              ? "yellow"
              : t.status === "Returned"
              ? "gray"
              : "green";

          const coverTone =
            t.status === "Overdue"
              ? "teal"
              : t.status === "Pending"
              ? "yellow"
              : t.status === "Returned"
              ? "gray"
              : "blue";

          // Format due date for readability
          const dueStr = t.due ? new Date(t.due).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "-";

          // Determine if a fine exists and whether it has been paid
          const hasFine = t.fine && t.fine > 0;
          const finePaid = t.finePaid;

          // Handlers for actions
          const onReturn = () => {
            returnBook(t.id);
          };
          const onPayFine = () => {
            payFine(t.id);
          };

          return (
            <div className="txRow" key={t.id}>
              <div className="txBook">
                <div className={`bookCover cover-${coverTone}`} />
                <div>
                  <div className="txTitle">{title}</div>
                  <div className="txSub">
                    {author} <span className="dot">•</span> ID: #{id}
                  </div>
                </div>
              </div>
              <div className="txCell">{t.borrower}</div>
              <div className="txCell">{dueStr}</div>
              <div className="txCell">
                <span className={`pill pill-${statusTone}`}>{t.status}</span>
              </div>
              <div className="txCell txAction">
                {/* Show actions based on transaction status */}
                {t.status !== "Returned" ? (
                  <div className="txActions">
                    <button className="txBtn txBtn-primary" onClick={onReturn}>✓ Return</button>
                    {hasFine && !finePaid && (
                      <button className="txBtn txBtn-warning" onClick={onPayFine}>$ Collect</button>
                    )}
                  </div>
                ) : (
                  hasFine && !finePaid ? (
                    <button className="txBtn txBtn-warning" onClick={onPayFine}>$ Collect</button>
                  ) : (
                    <span className="txEmpty">—</span>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
