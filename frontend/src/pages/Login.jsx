import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/login.css";

export default function Login() {
  // Use auth hook to access login function and current user
  const { login } = useAuth();
  const nav = useNavigate();

  // Local state for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Retain name and role for UI demonstration; they are not sent during
  // backend login but are used by the mock login fallback when no
  // password is provided.
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [busy, setBusy] = useState(false);

  // Handle form submit.  When a password is supplied the login
  // function will authenticate against the backend.  On success the
  // returned user role determines the redirect.
  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const payload = password
      ? { email, password }
      : { email, name, role: selectedRole };
    const res = await login(payload);
    setBusy(false);

    if (!res.ok) {
      alert(res.message || "Login gagal");
      return;
    }

    // Determine the role from the response (backend login) or
    // fallback to selectedRole for mock login.  'member' roles are
    // normalised to 'user' in AuthContext.
    const role = res.user?.role || selectedRole;
    if (role === 'librarian') {
      nav("/");
    } else {
      nav("/user/dashboard");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {/* Title only – remove decorative book icon for a cleaner look */}
          <h1 className="login-title">Sistem Perpustakaan</h1>
          <p className="login-subtitle">Silakan login untuk melanjutkan</p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          {/* Role Selector for demonstration; optional for backend login */}
          <div className="role-selector">
            <label className="role-label">Pilih Peran:</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${selectedRole === 'user' ? 'active' : ''}`}
                onClick={() => setSelectedRole('user')}
              >
                {/* Remove emoji for a neutral appearance */}
                <div className="role-icon"></div>
                <div className="role-info">
                  <div className="role-name">Member / User</div>
                  <div className="role-desc">Pinjam buku, lihat katalog</div>
                </div>
              </button>

              <button
                type="button"
                className={`role-btn ${selectedRole === 'librarian' ? 'active' : ''}`}
                onClick={() => setSelectedRole('librarian')}
              >
                {/* Remove emoji for a neutral appearance */}
                <div className="role-icon"></div>
                <div className="role-info">
                  <div className="role-name">Staf Perpustakaan</div>
                  <div className="role-desc">Kelola buku, transaksi, member</div>
                </div>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="info-box">
            {/* Remove info icon to reduce decorative clutter */}
            <div className="info-icon"></div>
            <div className="info-content">
              <strong>Mode Testing:</strong> Pilih peran untuk melihat fitur yang berbeda.
              {selectedRole === 'user' ? (
                <div className="features-list">
                  <div>Dashboard Member</div>
                  <div>Katalog Buku</div>
                  <div>Pinjam Buku</div>
                  <div>Riwayat Peminjaman</div>
                </div>
              ) : (
                <div className="features-list">
                  <div>Dashboard Staf</div>
                  <div>Kelola Inventori</div>
                  <div>Permintaan Peminjaman</div>
                  <div>Transaksi &amp; Member</div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`your@email.com`}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Optional name field for mock login */}
          <div className="form-group">
            <label htmlFor="name">Nama (opsional)</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedRole === 'user' ? 'Member Perpustakaan' : 'Staf Perpustakaan'}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={busy}>
            {/* Remove emoji from button label */}
            {busy ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="login-footer">
          <p>Belum punya akun? <Link to="/register">Daftar</Link></p>
        </div>
      </div>
    </div>
  );
}
