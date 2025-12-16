import React, { createContext, useContext, useMemo, useState } from "react";

const Ctx = createContext(null);

const seedBooks = [
  { id: "B8492", title: "Design of Everyday Things", author: "Don Norman", category: "Design", stock: 3 },
  { id: "B1023", title: "Clean Code", author: "Robert C. Martin", category: "Programming", stock: 0 },
  { id: "B4421", title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Comp Sci", stock: 2 },
];

const seedTx = [
  { id: "T1", bookId: "B8492", borrower: "Alice Freeman", due: "Oct 26, 2023", status: "Pending" },
  { id: "T2", bookId: "B1023", borrower: "John Smith", due: "Oct 20, 2023", status: "Overdue" },
  { id: "T3", bookId: "B4421", borrower: "Emily Blunt", due: "Nov 01, 2023", status: "Active" },
];

const seedRequests = [
  { id: "R1", name: "Marcus Aurelius", role: "Student", time: "requested 2 hours ago", bookId: "B8492" },
  { id: "R2", name: "Sarah Connor", role: "Faculty", time: "requested 5 hours ago", bookId: "B4421" },
];

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState(seedBooks);
  const [transactions, setTransactions] = useState(seedTx);
  const [requests, setRequests] = useState(seedRequests);

  const stats = useMemo(() => {
    const totalBooks = books.reduce((sum, b) => sum + (Number(b.stock) || 0), 0);
    const issued = transactions.filter((t) => t.status === "Active" || t.status === "Overdue").length;
    const overdue = transactions.filter((t) => t.status === "Overdue").length;
    const members = 1205; // mock
    return { totalBooks, issued, overdue, members };
  }, [books, transactions]);

  function addBook({ title, author, category, stock }) {
    const id = `B${Math.floor(1000 + Math.random() * 9000)}`;
    setBooks((prev) => [
      { id, title: title.trim(), author: author.trim(), category: (category || "General").trim(), stock: Number(stock) || 0 },
      ...prev,
    ]);
    return id;
  }

  function approveRequest(reqId) {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
  }

  function denyRequest(reqId) {
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
  }

  function quickReturn(bookIdRaw) {
    const bookId = String(bookIdRaw || "").trim();
    if (!bookId) return;

    setBooks((prev) => prev.map((b) => (b.id === bookId ? { ...b, stock: (Number(b.stock) || 0) + 1 } : b)));
    setTransactions((prev) =>
      prev.map((t) =>
        t.bookId === bookId && (t.status === "Active" || t.status === "Overdue")
          ? { ...t, status: "Returned" }
          : t
      )
    );
  }

  const value = useMemo(
    () => ({ books, transactions, requests, stats, addBook, approveRequest, denyRequest, quickReturn }),
    [books, transactions, requests, stats]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
