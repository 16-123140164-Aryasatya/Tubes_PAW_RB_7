import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const res = await register(name, email, password);
    setBusy(false);

    if (!res.ok) return toast.push(res.message || "Register failed", "error");

    toast.push("Registered! Please login.", "success");
    nav("/login");
  }

  return (
    <div className="stack">
      <Card title="Register" subtitle="Create account">
        <form className="stack" onSubmit={onSubmit}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="row">
            <Button variant="primary" type="submit" disabled={busy}>
              {busy ? "Creating..." : "Register"}
            </Button>
            <Link className="btn" to="/login">
              Back to login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
