import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/login.css";

export default function Register({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!termsAccepted) {
      setMessage("⚠️ Anda harus menyetujui syarat dan ketentuan untuk mendaftar.");
      return;
    }

    setLoading(true);

    try {
      // Hanya member yang bisa register, librarian hanya bisa login
      const res = await register(name, email, password, "member");

      if (!res.ok) {
        setMessage(res.message || "Pendaftaran gagal. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      // Auto login setelah register
      const loginRes = await login({ email, password });
      setLoading(false);

      if (!loginRes.ok) {
        setMessage("Pendaftaran berhasil, tapi login otomatis gagal. Silakan login manual.");
        return;
      }

      navigate("/user/dashboard");
    } catch (err) {
      setMessage("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-header">
          <div className="login-logo">
            <svg className="login-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="login-title">Perpustakaan Digital</div>
        </div>

        <div className="login-main-content">
          <div className="login-headings">
            <h1 className="login-h1">Buat akun baru</h1>
            <p className="login-subtitle">
              Daftar sebagai member untuk meminjam buku
            </p>
          </div>

          <form onSubmit={handleRegister} className="login-form">
            {message && (
              <div className={`login-error ${message.includes("berhasil") ? "login-success" : ""}`}>
                {message.includes("berhasil") ? (
                  <svg className="error-icon success-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ) : (
                  <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                )}
                <p className="login-error-text">{message}</p>
              </div>
            )}

            <div className="login-input-section">
              <div className="login-input-group">
                <label htmlFor="name" className="login-input-label">
                  Nama Lengkap
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="name"
                    type="text"
                    placeholder="Nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="login-input"
                    required
                    disabled={loading}
                  />
                  <div className="login-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="email" className="login-input-label">
                  Email
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    required
                    disabled={loading}
                  />
                  <div className="login-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="login-input-group">
                <label htmlFor="password" className="login-input-label">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    required
                    minLength="6"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <label className="login-remember-label">
              <input
                type="checkbox"
                className="login-remember-checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={loading}
              />
              <span className="login-remember-text">
                Saya setuju dengan syarat dan ketentuan *
              </span>
            </label>

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? "Mendaftarkan..." : "Daftar"}
            </button>
          </form>

          <div className="login-signup-section">
            <span className="login-signup-text">Sudah punya akun? </span>
            <Link to="/login" className="login-signup-link">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>

      <div className="login-right">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuByQUUB6wGlhXluObx66gmVOirVDB7Pr7r5dF1vp6_zrETur6nKVvNM6MbWne-p-LQfmPm8kJH75ar2zeAWB_XMbS8jVImFpXx4de9YPjzn53hBKi7aYHBpYKzTndd6JLIkQl88kZCvmo71ROJMHba0116JqU9DLu5dKgdnzmWqLVDu0UR6PELcoof-rJCdQX60gfgD7KciWNm7B7OsEtLxPPkhjnFIAh_G91wXGuGUEYopzukHT3QNWm7TxtlOU7W9c2vrCc7OxR64"
          alt="Library Background"
          className="login-bg-image"
        />
        <div className="login-bg-overlay"></div>
        <div className="login-right-content">
          <div className="login-quote">
            <div className="login-quote-badge">
              <span className="login-quote-badge-text">📖 Bergabung</span>
            </div>
            <blockquote className="login-quote-text">
              "Membaca adalah petualangan tanpa batas"
            </blockquote>
            <div className="login-quote-footer">
              <div className="login-quote-divider"></div>
              <cite className="login-quote-author">- Komunitas Pembaca</cite>
            </div>
          </div>
        </div>
        <div className="login-decorative">
          <div className="login-decorative-dot"></div>
          <div className="login-decorative-dot-2"></div>
          <div className="login-decorative-dot-3"></div>
        </div>
      </div>
    </div>
  );
}
