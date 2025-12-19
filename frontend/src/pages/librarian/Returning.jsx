import React, { useEffect, useState } from "react";
import { useLibrary } from "../../store/LibraryStore";
import { BorrowAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";
import Loading from "../../components/Loading";
import "./Returning.css";

/**
 * Returning page for librarians to confirm return requests from members.
 * Displays pending return requests with option to approve (mark returned + calculate fine)
 * or deny (revert to active status).
 */
export default function Returning() {
  const toast = useToast();
  const { books, returnRequests, approveReturn, denyReturn } = useLibrary();
  const [expanded, setExpanded] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [details, setDetails] = useState({}); // Map of returnReq.id -> detail info

  // Load details (calculate fine) for each return request
  useEffect(() => {
    const loadDetails = async () => {
      const detailsMap = {};
      for (const req of returnRequests) {
        // Get borrowing detail untuk calculate fine
        try {
          const res = await BorrowAPI.list();
          const data = res.data?.data || res.data?.borrowings || [];
          const borrowing = Array.isArray(data) ? data.find((b) => b.id === req.id) : null;
          if (borrowing) {
            const dueDate = borrowing.due_date ? new Date(borrowing.due_date) : null;
            const now = new Date();
            let fine = 0;
            if (dueDate && dueDate < now) {
              const daysLate = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
              fine = daysLate > 0 ? daysLate * 5000 : 0; // Rp 5000 per hari
            }
            detailsMap[req.id] = {
              dueDate: dueDate ? dueDate.toLocaleDateString() : "-",
              daysOverdue: dueDate && dueDate < now ? Math.floor((now - dueDate) / (1000 * 60 * 60 * 24)) : 0,
              fine,
            };
          }
        } catch (e) {
          console.error("Failed to load borrowing detail", normalizeError(e));
        }
      }
      setDetails(detailsMap);
    };
    if (returnRequests.length > 0) {
      loadDetails();
    }
  }, [returnRequests]);

  const handleApprove = async (id) => {
    setLoadingId(id);
    setShowLoading(true);
    setLoadingMessage("Memproses persetujuan pengembalian...");
    try {
      await approveReturn(id);
      toast.push("Pengembalian disetujui, buku telah dikembalikan", "success");
    } catch (e) {
      toast.push(normalizeError(e), "error");
    } finally {
      setShowLoading(false);
      setLoadingId(null);
    }
  };

  const handleDeny = async (id) => {
    setLoadingId(id);
    setShowLoading(true);
    setLoadingMessage("Memproses penolakan pengembalian...");
    try {
      await denyReturn(id);
      toast.push("Pengembalian ditolak, status kembali aktif", "success");
    } catch (e) {
      toast.push(normalizeError(e), "error");
    } finally {
      setShowLoading(false);
      setLoadingId(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {showLoading && <Loading label={loadingMessage} fullScreen />}
      
      <div style={{ marginBottom: "20px" }}>
        <h1>Return Requests</h1>
        <p style={{ color: "#666", marginTop: "4px" }}>
          Review and process return requests from members. Approve to mark as returned and calculate fines for late returns.
        </p>
      </div>

      {returnRequests.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f5f5f5", borderRadius: "8px", color: "#999" }}>
          No return requests at this time.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {returnRequests.map((req) => {
            const book = books.find((b) => b.id === req.bookId);
            const detail = details[req.id] || {};
            const isExpanded = expanded === req.id;

            return (
              <div
                key={req.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}
              >
                {/* Header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : req.id)}
                  style={{
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#e3f2fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#0066cc",
                      }}
                    >
                      {req.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "16px" }}>{req.name}</div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        {book?.title || `Book ${req.bookId}`}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: detail.fine > 0 ? "#ffebee" : "#e8f5e9",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: detail.fine > 0 ? "#c62828" : "#2e7d32",
                    }}
                  >
                    {detail.fine > 0 ? `Late: Rp ${detail.fine.toLocaleString()}` : "On time"}
                  </div>
                  <div style={{ marginLeft: "12px", color: "#999" }}>
                    {isExpanded ? "▼" : "▶"}
                  </div>
                </div>

                {/* Details */}
                {isExpanded && (
                  <div style={{ padding: "16px", borderTop: "1px solid #eee", backgroundColor: "#fafafa" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#999", textTransform: "uppercase", fontWeight: "600" }}>
                          Member
                        </div>
                        <div style={{ fontSize: "14px", marginTop: "4px" }}>{req.name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#999", textTransform: "uppercase", fontWeight: "600" }}>
                          Book
                        </div>
                        <div style={{ fontSize: "14px", marginTop: "4px" }}>{book?.title || `Book ${req.bookId}`}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#999", textTransform: "uppercase", fontWeight: "600" }}>
                          Due Date
                        </div>
                        <div style={{ fontSize: "14px", marginTop: "4px" }}>{detail.dueDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#999", textTransform: "uppercase", fontWeight: "600" }}>
                          Days Overdue
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            marginTop: "4px",
                            color: detail.daysOverdue > 0 ? "#c62828" : "#2e7d32",
                            fontWeight: detail.daysOverdue > 0 ? "600" : "400",
                          }}
                        >
                          {detail.daysOverdue} day{detail.daysOverdue !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {detail.fine > 0 && (
                      <div
                        style={{
                          padding: "12px",
                          backgroundColor: "#ffebee",
                          border: "1px solid #ffcdd2",
                          borderRadius: "6px",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "#c62828", fontWeight: "600", marginBottom: "4px" }}>
                          ⚠️ LATE RETURN FEE
                        </div>
                        <div style={{ fontSize: "18px", color: "#c62828", fontWeight: "700" }}>
                          Rp {detail.fine.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "12px", color: "#b71c1c", marginTop: "4px" }}>
                          {detail.daysOverdue} day{detail.daysOverdue !== 1 ? "s" : ""} × Rp 5.000/day
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={loadingId === req.id}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          backgroundColor: "#4caf50",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "600",
                          cursor: loadingId === req.id ? "wait" : "pointer",
                          fontSize: "14px",
                          opacity: loadingId === req.id ? 0.6 : 1,
                        }}
                      >
                        {loadingId === req.id ? "⏳ Processing..." : "✓ Approve Return"}
                      </button>
                      <button
                        onClick={() => handleDeny(req.id)}
                        disabled={loadingId === req.id}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          backgroundColor: "#f44336",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "600",
                          cursor: loadingId === req.id ? "wait" : "pointer",
                          fontSize: "14px",
                          opacity: loadingId === req.id ? 0.6 : 1,
                        }}
                      >
                        {loadingId === req.id ? "⏳ Processing..." : "✗ Deny Return"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
