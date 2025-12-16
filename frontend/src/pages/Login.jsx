import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);

    if (!res.ok) return toast.push(res.message || "Login failed", "error");

    toast.push("Logged in!", "success");
    nav("/");
  }

  return (
    <div className="stack">
      <Card title="Login" subtitle="Welcome back">
        <form className="stack" onSubmit={onSubmit}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="row">
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? "Signing in..." : "Login"}
            </Button>
            <Link className="btn" to="/register">
              Register
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
