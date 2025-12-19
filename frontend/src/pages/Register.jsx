import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
// Reuse the styling from the login page.  The register page shares
// the same card layout and input styles, so importing the login
// stylesheet applies those rules here as well.  Additional classes
// defined below use the same naming convention to ensure a cohesive
// appearance.
import "../styles/login.css";

export default function Register() {
  // Access authentication actions and helpers
  const { register, login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  // Local state for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Flag to show loading indicator on submit
  const [busy, setBusy] = useState(false);
  // Role selection, defaults to member.  Librarian registers staff.
  const [role, setRole] = useState("member");

  /**
   * Handle form submission.  Creates a new user via the auth
   * context, then logs them in and redirects based on their role.  On
   * error, a toast message is shown and the user remains on the form.
   */
  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    // Call the register function with selected role
    const res = await register(name, email, password, role);
    if (!res.ok) {
      setBusy(false);
      toast.push(res.message || "Pendaftaran gagal", "error");
      return;
    }
    // Automatically log in after registration
    const loginRes = await login({ email, password });
    setBusy(false);
    if (!loginRes.ok) {
      toast.push("Terdaftar, namun login gagal. Silakan login manual.", "error");
      nav("/login");
      return;
    }
    // Determine redirect based on role (member → user dashboard)
    const r = loginRes.user?.role || role;
    toast.push("Pendaftaran berhasil!", "success");
    if (r === "librarian") nav("/");
    else nav("/user/dashboard");
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          {/* Title only – remove decorative book icon */}
          <h1 className="login-title">Buat Akun Baru</h1>
          <p className="login-subtitle">Silakan lengkapi informasi berikut</p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nama</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="Password"
              required
            />
          </div>
          {/* Role selection implemented with the same button style as the login page */}
          <div className="form-group">
            <label className="role-label">Pilih Peran:</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${role === 'member' ? 'active' : ''}`}
                onClick={() => setRole('member')}
              >
                {/* Empty icon for consistent spacing */}
                <div className="role-icon"></div>
                <div className="role-info">
                  <div className="role-name">Member</div>
                  <div className="role-desc">Pinjam &amp; lihat buku</div>
                </div>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'librarian' ? 'active' : ''}`}
                onClick={() => setRole('librarian')}
              >
                {/* Empty icon for consistent spacing */}
                <div className="role-icon"></div>
                <div className="role-info">
                  <div className="role-name">Librarian</div>
                  <div className="role-desc">Kelola perpustakaan</div>
                </div>
              </button>
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={busy}>
            {/* Remove emoji from button label */}
            {busy ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Sudah punya akun? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
