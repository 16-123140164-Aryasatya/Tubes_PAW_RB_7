import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { BooksAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";

function normalizeBooksResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.books)) return data.books;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function ManageBooks() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    year: "",
    category: "",
    description: "",
    copies_available: ""
  });

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function refresh() {
    try {
      setLoading(true);
      const res = await BooksAPI.list();
      setBooks(normalizeBooksResponse(res.data));
    } catch (err) {
      toast.push(normalizeError(err), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return books;
    return books.filter((b) => (b?.title || "").toLowerCase().includes(s));
  }, [books, q]);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", author: "", year: "", category: "", description: "", copies_available: "" });
    setOpen(true);
  }

  function openEdit(book) {
    setEditing(book);
    setForm({
      title: book.title ?? "",
      author: book.author ?? "",
      year: book.year ?? "",
      category: book.category ?? "",
      description: book.description ?? "",
      copies_available: book.copies_available ?? book.stock ?? book.quantity ?? ""
    });
    setOpen(true);
  }

  async function save() {
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        copies_available: form.copies_available ? Number(form.copies_available) : undefined
      };

      if (editing) {
        const id = editing.id ?? editing._id;
        await BooksAPI.update(id, payload);
        toast.push("Book updated", "success");
      } else {
        await BooksAPI.create(payload);
        toast.push("Book created", "success");
      }
      setOpen(false);
      refresh();
    } catch (err) {
      toast.push(normalizeError(err), "error");
    }
  }

  async function remove(book) {
    try {
      const id = book.id ?? book._id;
      await BooksAPI.remove(id);
      toast.push("Book deleted", "success");
      refresh();
    } catch (err) {
      toast.push(normalizeError(err), "error");
    }
  }

  return (
    <div className="stack">
      <Card
        title="Manage Books"
        subtitle="Create / update / delete"
        actions={
          <div className="row">
            <Input placeholder="Search title..." value={q} onChange={(e) => setQ(e.target.value)} />
            <Button variant="primary" onClick={openCreate}>
              + Add
            </Button>
          </div>
        }
      >
        {loading ? (
          <Loading label="Loading..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No books" />
        ) : (
          <div className="table">
            <div className="thead">
              <div>Title</div>
              <div>Author</div>
              <div>Stock</div>
              <div>Actions</div>
            </div>
            {filtered.map((b) => (
              <div className="trow" key={b.id ?? b._id ?? b.title}>
                <div>{b.title}</div>
                <div>{b.author ?? "-"}</div>
                <div>{b.copies_available ?? b.stock ?? b.quantity ?? "-"}</div>
                <div className="row">
                  <Button onClick={() => openEdit(b)}>Edit</Button>
                  <Button variant="danger" onClick={() => remove(b)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        title={editing ? "Edit Book" : "Add Book"}
        onClose={() => setOpen(false)}
      >
        <div className="stack">
          <Input label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} />
          <Input label="Author" value={form.author} onChange={(e) => setField("author", e.target.value)} />
          <Input label="Year" value={form.year} onChange={(e) => setField("year", e.target.value)} />
          <Input label="Category" value={form.category} onChange={(e) => setField("category", e.target.value)} />
          <Input label="Description" value={form.description} onChange={(e) => setField("description", e.target.value)} />
          <Input
            label="Copies Available"
            value={form.copies_available}
            onChange={(e) => setField("copies_available", e.target.value)}
          />

          <div className="row">
            <Button variant="primary" onClick={save}>
              Save
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </div>

          <div className="hint">
            * Kalau backend kamu pakai field selain <code>copies_available</code> (mis. <code>stock</code>),
            tinggal kita mapping di API/payload.
          </div>
        </div>
      </Modal>
    </div>
  );
}
