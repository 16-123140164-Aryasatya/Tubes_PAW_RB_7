import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BooksAPI, BorrowAPI } from "../api/endpoints";
import { normalizeError } from "../api/client";

/**
 * LibraryStore provides global state for librarian pages.  Unlike the
 * original implementation which contained hard‑coded seeds for books,
 * transactions, and requests, this version fetches data from the
 * backend API on mount and exposes helper functions to mutate that
 * data via API calls.  The shape of the state mirrors the existing
 * pages to minimise refactoring.
 */
const Ctx = createContext(null);

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);

  /**
   * Load books from the backend.  On success the books array will
   * contain objects with id, title, author, category and stock
   * (derived from copies_available).  Errors are silently ignored
   * because Toast is not available in this context.
   */
  async function loadBooks() {
    try {
      const res = await BooksAPI.list();
      const data = res.data?.data || res.data?.books || res.data || [];
      const items = Array.isArray(data) ? data : [];
      // Normalise to match previous shape: id, title, author, category, stock
      const mapped = items.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        stock: b.copies_available ?? b.stock ?? b.quantity ?? 0,
      }));
      setBooks(mapped);
    } catch (e) {
      console.error("Failed to load books", normalizeError(e));
    }
  }

  /**
   * Load borrowings from the backend and map them into the
   * `transactions` array expected by the UI.  Each transaction
   * contains: id, bookId, borrower name, due date string and status
   * (Active, Overdue, Returned).  Requests are borrow requests (PENDING from creation),
   * while returnRequests are return requests (PENDING from return action).
   */
  async function loadBorrowings() {
    try {
      // Fetch all borrowings regardless of status
      const res = await BorrowAPI.list();
      const data = res.data?.data || res.data?.borrowings || res.data || [];
      const items = Array.isArray(data) ? data : [];
      const txs = [];
      const borrowReqs = [];
      const returnReqs = [];
      
      items.forEach((br) => {
        // Derive status: backend returns status in br.status if implemented,
        // otherwise derive from return_date/due_date
        let status;
        if (br.status) {
          status = br.status;
        } else if (!br.return_date) {
          const due = new Date(br.due_date);
          const now = new Date();
          status = now > due ? "overdue" : "active";
        } else {
          status = "returned";
        }
        
        // Untuk menentukan apakah ini borrow request atau return request,
        // gunakan indikator: status PENDING + return_date terisi => return request
        // status PENDING + return_date kosong => borrow request
        const isPending = String(status).toLowerCase() === "pending";
        const isReturnPending = isPending && !!br.return_date;
        const isBorrowPending = isPending && !br.return_date;
        
        // Normalize status to Title case for UI
        const statusDisplay =
          status === "overdue" ? "Overdue" : status === "active" ? "Active" : status === "pending" ? "Pending" : "Returned";
        
        txs.push({
          id: br.id,
          bookId: br.book?.id || br.book_id,
          borrower: br.member?.name || br.member?.email || "-",
          due: br.due_date ? new Date(br.due_date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-",
          status: statusDisplay,
        });
        
        // Populate requests list with PENDING borrowings (borrow approval requests)
        if (isBorrowPending) {
          borrowReqs.push({
            id: br.id,
            name: br.member?.name || br.member?.email || "-",
            role: br.member?.role || "Member",
            time: br.borrow_date ? new Date(br.borrow_date).toLocaleDateString() : "-",
            bookId: br.book?.id || br.book_id,
            type: "borrow",
          });
        }
        if (isReturnPending) {
          returnReqs.push({
            id: br.id,
            name: br.member?.name || br.member?.email || "-",
            role: br.member?.role || "Member",
            time: br.return_date ? new Date(br.return_date).toLocaleDateString() : "-",
            bookId: br.book?.id || br.book_id,
            type: "return",
          });
        }
        
        // Note: Return requests juga PENDING, tapi ini butuh cara untuk membedakan
        // Solusi: kita bisa track di UI component atau backend return field
        // Untuk sekarang, kita ambil dari backend calculate
        // Client akan handle di component level nanti
      });
      
      setTransactions(txs);
      setRequests(borrowReqs);
      setReturnRequests(returnReqs);
    } catch (e) {
      console.error("Failed to load borrowings", normalizeError(e));
    }
  }

  // On mount, fetch books and borrowings
  useEffect(() => {
    loadBooks();
    loadBorrowings();
  }, []);

  /**
   * Compute dashboard statistics.  Total books is the sum of the
   * available stock.  Issued is count of transactions with Active
   * status, overdue is count with Overdue status.  Members is still
   * mocked at 1205.
   */
  const stats = useMemo(() => {
    const totalBooks = books.reduce((sum, b) => sum + (Number(b.stock) || 0), 0);
    const issued = transactions.filter((t) => t.status === "Active" || t.status === "Overdue").length;
    const overdue = transactions.filter((t) => t.status === "Overdue").length;
    const members = 1205;
    return { totalBooks, issued, overdue, members };
  }, [books, transactions]);

  /**
   * Create a new book via API then refresh books list.  Accepts
   * payload containing title, author, category and stock.  Returns the
   * new book's ID on success.  Errors are logged to console.
   */
  async function addBook({ title, author, category, stock }) {
    try {
      const payload = {
        title: title?.trim(),
        author: author?.trim(),
        category: category?.trim() || "General",
        copies_available: Number(stock) || 0,
      };
      const res = await BooksAPI.create(payload);
      const newId = res.data?.data?.id || res.data?.id;
      // reload books after creation
      await loadBooks();
      return newId;
    } catch (e) {
      console.error("Failed to add book", normalizeError(e));
      return null;
    }
  }

  /**
   * Update an existing book.  Accepts an ID and payload with any
   * updatable fields (title, author, category, copies_available).
   * Calls the backend PUT endpoint and refreshes the local books
   * list upon success.  Returns true on success, false on error.
   */
  async function updateBook(id, payload) {
    if (!id) return false;
    try {
      await BooksAPI.update(id, payload);
      await loadBooks();
      return true;
    } catch (e) {
      console.error("Failed to update book", normalizeError(e));
      return false;
    }
  }

  /**
   * Remove a book by its ID.  Sends a DELETE request to the
   * backend and refreshes the books list upon success.  Returns
   * true on success, false on error.
   */
  async function removeBook(id) {
    if (!id) return false;
    try {
      await BooksAPI.remove(id);
      await loadBooks();
      return true;
    } catch (e) {
      console.error("Failed to remove book", normalizeError(e));
      return false;
    }
  }

  /**
   * Approve a request by returning the book.  In this simplified
   * implementation borrowings are automatically approved when
   * created, so approving a request simply marks the transaction as
   * returned and refreshes the borrowings list.
   */
  async function approveRequest(reqId) {
    try {
      // Librarian approves a borrow request.  This calls the dedicated
      // endpoint to mark the borrowing as approved.  After the
      // approval we refresh the borrowings list.
      await BorrowAPI.approve(reqId);
      await loadBorrowings();
    } catch (e) {
      console.error("Failed to approve request", normalizeError(e));
    }
  }

  /**
   * Deny a request.  Since we cannot truly cancel a borrowing via the
   * current backend, this simply marks the borrowing as returned
   * (similar to approve) to remove it from the active list.
   */
  async function denyRequest(reqId) {
    try {
      // Librarian denies a borrow request.  This calls a dedicated
      // endpoint which marks the borrowing as denied and increases
      // available stock.  After the denial we refresh the borrowings.
      await BorrowAPI.deny(reqId);
      await loadBorrowings();
    } catch (e) {
      console.error("Failed to deny request", normalizeError(e));
    }
  }

  /**
   * Quick return a book by its ID.  This finds the first active
   * borrowing matching the given bookId and calls the return API.
   */
  async function quickReturn(bookIdRaw) {
    const bookId = String(bookIdRaw || "").trim();
    if (!bookId) return;
    try {
      // find transaction with this bookId that is active or overdue
      const tx = transactions.find(
        (t) => t.bookId === bookId && (t.status === "Active" || t.status === "Overdue")
      );
      if (!tx) return;
      await BorrowAPI.returnBook(tx.id);
      await loadBorrowings();
    } catch (e) {
      console.error("Failed to return book", normalizeError(e));
    }
  }

  /**
   * Approve a return request. Sets the borrowing status to RETURNED
   * and calculates fine if overdue.
   */
  async function approveReturn(returnReqId) {
    try {
      await BorrowAPI.approveReturn(returnReqId);
      await loadBorrowings();
    } catch (e) {
      console.error("Failed to approve return", normalizeError(e));
    }
  }

  /**
   * Deny a return request. Sets the borrowing status back to ACTIVE.
   */
  async function denyReturn(returnReqId) {
    try {
      await BorrowAPI.denyReturn(returnReqId);
      await loadBorrowings();
    } catch (e) {
      console.error("Failed to deny return", normalizeError(e));
    }
  }

  const value = useMemo(
    () => ({
      books,
      transactions,
      requests,
      returnRequests,
      stats,
      addBook,
      updateBook,
      removeBook,
      approveRequest,
      denyRequest,
      quickReturn,
      approveReturn,
      denyReturn,
    }),
    [books, transactions, requests, returnRequests, stats]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
