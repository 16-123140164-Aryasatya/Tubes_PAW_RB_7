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
            <div className="login-logo-icon">📚</div>
          </div>
          <div className="login-title">Librarizz</div>
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
                <p className="login-error-text">
                  {message.includes("berhasil") ? "✅" : "⚠️"} {message}
                </p>
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
                    <span className="login-input-icon-element">👤</span>
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
                    <span className="login-input-icon-element">✉️</span>
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
                    <span className="login-input-icon-element">
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </span>
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
