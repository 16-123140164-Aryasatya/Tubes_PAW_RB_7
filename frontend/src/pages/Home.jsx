import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";

export default function Home() {
  return (
    <div className="stack">
      <Card
        title="Welcome to LibManager"
        subtitle="Browse books, and manage borrow flow (librarian)."
        actions={
          <div className="row">
            <Link className="btn btn-primary" to="/books">
              Browse Books
            </Link>
          </div>
        }
      >
        <ul className="list">
          <li>Public page: list & detail buku</li>
          <li>Auth: login/register + session persist</li>
          <li>Role-based area: librarian dashboard</li>
        </ul>
      </Card>
    </div>
  );
}
