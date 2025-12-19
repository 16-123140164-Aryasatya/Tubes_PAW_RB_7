import React, { useState } from "react";
import { useLibrary } from "../../store/LibraryStore";
import { useToast } from "../../components/Toast";
import Loading from "../../components/Loading";
import "./BorrowRequests.css";

export default function BorrowRequests() {
  const { requests, books, approveRequest, denyRequest } = useLibrary();
  const toast = useToast();
  const [loadingId, setLoadingId] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleApprove = async (id, name) => {
    setLoadingId(id);
    setShowLoading(true);
    setLoadingMessage("Memproses persetujuan peminjaman...");
    try {
      await approveRequest(id);
      toast.push(`Peminjaman untuk ${name} disetujui`, "success");
    } catch (e) {
      toast.push("Gagal menyetujui peminjaman", "error");
    } finally {
      setShowLoading(false);
      setLoadingId(null);
    }
  };

  const handleDeny = async (id, name) => {
    setLoadingId(id);
    setShowLoading(true);
    setLoadingMessage("Memproses penolakan peminjaman...");
    try {
      await denyRequest(id);
      toast.push(`Peminjaman untuk ${name} ditolak`, "success");
    } catch (e) {
      toast.push("Gagal menolak peminjaman", "error");
    } finally {
      setShowLoading(false);
      setLoadingId(null);
    }
  };

  return (
    <div className="panel">
      {showLoading && <Loading label={loadingMessage} fullScreen />}
      
      <div className="panelHead">
        <div className="panelTitle">Borrow Requests</div>
        <div className="chip chip-blue">{requests.length} Pending</div>
      </div>

      <div className="borrowList">
        {requests.map((r) => {
          const b = books.find((x) => x.id === r.bookId);
          const meta = `${b?.category ?? "General"} • ${b?.stock > 0 ? "In Stock" : "Out of Stock"}`;
          const isLoading = loadingId === r.id;

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
                <button 
                  className="btnSoft btnSoft-green" 
                  onClick={() => handleApprove(r.id, r.name)}
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                >
                  {isLoading ? (
                    <>⏳ Loading...</>
                  ) : (
                    <>
                      <svg className="btn-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Approve
                    </>
                  )}
                </button>
                <button 
                  className="btnSoft btnSoft-red" 
                  onClick={() => handleDeny(r.id, r.name)}
                  disabled={isLoading}
                  style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'wait' : 'pointer' }}
                >
                  {isLoading ? '⏳ Loading...' : 'Deny'}
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
