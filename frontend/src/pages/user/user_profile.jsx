import React, { useEffect, useState } from "react";
import "./user_profile.css";
import { useAuth } from "../../auth/AuthContext";
import { BorrowAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";

/**
 * UserProfile shows account details for the logged in member.  It pulls
 * borrowing data to compute simple stats like active loans and
 * outstanding fines.  Personal information is derived from the
 * AuthContext.  Actions like logout and edit profile are stubbed.
 */
const UserProfile = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [borrowings, setBorrowings] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [myRes, histRes] = await Promise.all([
          BorrowAPI.my(),
          BorrowAPI.history(),
        ]);
        const myData = myRes.data?.data || myRes.data?.borrowings || myRes.data || [];
        const histData = histRes.data?.data || histRes.data?.borrowings || histRes.data || [];
        if (alive) {
          setBorrowings(Array.isArray(myData) ? myData : []);
          setHistory(Array.isArray(histData) ? histData : []);
        }
      } catch (e) {
        toast.push(normalizeError(e), "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute stats
  const booksBorrowed = borrowings.length;
  // Sum fines from borrowing history.  The backend includes a ``fine``
  // field in the borrowing payload which represents any outstanding
  // penalty.  Use that when present; otherwise, estimate based on
  // overdue days as a fallback for backward compatibility.
  const outstandingFines = history.reduce((sum, br) => {
    if (br.fine && !Number.isNaN(br.fine)) return sum + Number(br.fine);
    // Fallback estimation: overdue days * 1000
    const now = new Date();
    const due = br.due_date ? new Date(br.due_date) : null;
    const ret = br.return_date ? new Date(br.return_date) : null;
    if (!ret && due && due < now) {
      const daysLate = Math.floor((now - due) / (1000 * 60 * 60 * 24));
      return sum + (daysLate > 0 ? daysLate * 1000 : 0);
    }
    return sum;
  }, 0);

  // Helper to derive initials for avatar
  function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const init = parts.map((p) => p[0]).join("");
    return init.substring(0, 2).toUpperCase();
  }

  return (
    <div className="user-profile__content">
      <div className="user-profile__breadcrumbs">
          <span>Home</span>
          <span className="divider">/</span>
          <span>My Account</span>
      </div>

      <section className="card card--profile">
        <div className="avatar avatar--xl">{initials(user?.name)}</div>
        <div className="card__profile-body">
          <div className="card__profile-heading">
            <div>
              <h2>{user?.name || "Member"}</h2>
              <p className="muted">Member ID: LIB-{user?.id || "000"}</p>
            </div>
          </div>
          <p className="muted">
            {user?.bio || "Thank you for being a valued member of our library."}
          </p>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card stat-blue">
          <p className="stat-label">Books Borrowed</p>
          <p className="stat-value">{booksBorrowed}</p>
        </div>
        <div className="stat-card stat-purple">
          <p className="stat-label">Reservations</p>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card stat-green">
          <p className="stat-label">Outstanding Fines</p>
          <p className="stat-value">Rp {outstandingFines.toLocaleString()}</p>
        </div>
      </section>

      <div className="layout-grid">
        <section className="card card--panel">
          <div className="card__section-head">
            <h3>Personal Information</h3>
            <span className="chip">Read Only</span>
          </div>
          <div className="info-grid">
            <div className="info-field">
              <p className="info-label">Full Name</p>
              <p className="info-value">{user?.name || "-"}</p>
            </div>
            <div className="info-field">
              <p className="info-label">Email Address</p>
              <p className="info-value">{user?.email || "-"}</p>
            </div>
            <div className="info-field">
              <p className="info-label">Member Since</p>
              <p className="info-value">{user?.created_at ? new Date(user.created_at).getFullYear() : "2025"}</p>
            </div>
            <div className="info-field info-field--wide">
              <p className="info-label">Role</p>
              <p className="info-value">{user?.role || "Member"}</p>
            </div>
          </div>
        </section>
        <section className="card card--panel card--preference">
          <div>
            <h4>Email Notifications</h4>
            <p className="muted">Receive updates about due dates and reservations.</p>
          </div>
          <label className="toggle" aria-label="Toggle email notifications">
            <input type="checkbox" defaultChecked />
            <span className="toggle__pill" aria-hidden />
          </label>
        </section>
      </div>

      <div className="layout-grid layout-grid--side">
        <section className="card card--membership">
          <div className="card__section-head">
            <div>
              <p className="muted small">Library Membership</p>
          <h3>{(user?.role || '').toLowerCase() === 'librarian' ? 'Librarian' : 'Standard Member'}</h3>
            </div>
          </div>
          <p className="membership-code">LIB {user?.id || "000"}</p>
          <p className="muted small">Valid until: 2026</p>
        </section>
        <section className="card card--panel card--security">
          <h3>Security</h3>
          <div className="meta-list">
            <div className="meta-row">
              <span className="muted">Last Login</span>
              <span>{user?.loginTime ? new Date(user.loginTime).toLocaleString() : '-'}</span>
            </div>
            <div className="meta-row">
              <span className="muted">2FA Status</span>
              <span>Disabled</span>
            </div>
          </div>
        </section>
        <section className="card card--danger">
          <h3>Danger Zone</h3>
          <p className="muted">
            Logging out will end your current session.
          </p>
          <button type="button" className="btn btn--danger btn--full" onClick={logout}>
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;