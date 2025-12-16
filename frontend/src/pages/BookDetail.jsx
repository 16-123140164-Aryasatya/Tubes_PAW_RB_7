import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import Loading from "../components/Loading";
import { BooksAPI } from "../api/endpoints";
import { normalizeError } from "../api/client";
import { useToast } from "../components/Toast";

export default function BookDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await BooksAPI.detail(id);
        const b = res.data?.book ?? res.data?.data ?? res.data;
        if (alive) setBook(b);
      } catch (err) {
        toast.push(normalizeError(err), "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [id, toast]);

  return (
    <div className="stack">
      <div className="row">
        <Link className="btn" to="/books">
          ← Back
        </Link>
      </div>

      <Card title="Book Detail" subtitle={id}>
        {loading ? (
          <Loading label="Loading detail..." />
        ) : !book ? (
          <div>Book not found.</div>
        ) : (
          <div className="kv">
            <div><b>Title:</b> {book.title}</div>
            <div><b>Author:</b> {book.author ?? "-"}</div>
            <div><b>Year:</b> {book.year ?? "-"}</div>
            <div><b>Category:</b> {book.category ?? "-"}</div>
            <div><b>Description:</b> {book.description ?? "-"}</div>
            <div>
              <b>Available:</b>{" "}
              {book.copies_available ?? book.stock ?? book.quantity ?? "-"}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
