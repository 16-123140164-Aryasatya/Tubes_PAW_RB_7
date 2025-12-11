import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/api/register", { name, email, password });
      setMessage("Registration successful! You can now login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setMessage("Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account ✨</h2>
        <p className="subtitle">Register to join the library</p>

        {message && <p className="info">{message}</p>}

        <form onSubmit={submit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
          />
          <button className="btn-primary" type="submit">
            Register
          </button>
        </form>

        <p className="switch-text">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
