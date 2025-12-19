import React, { useEffect, useMemo, useState } from "react";
// Import components relative to the ``src`` folder.  Because this file lives
// inside ``src/pages/librarian`` we need to go up two levels (../../) to
// reach components, API helpers and store hooks.  Without adjusting
// these paths the imports would resolve to the project root and Vite
// will fail to locate them during compilation.
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
// Bring in page-specific styles for the Manage Books grid.
import "./ManageBooks.css";
// Import API and store hooks.  ``BooksAPI`` exposes CRUD operations for
// books and ``useLibrary`` provides shared state for librarian pages.
import { BooksAPI } from "../../api/endpoints";
import { useLibrary } from "../../store/LibraryStore";
import { normalizeError } from "../../api/client";
import { useToast } from "../../components/Toast";

/*
 * Normalise the response from the backend.  The API may return an
 * array directly, or an object with a ``books`` or ``data`` key.  This
 * helper extracts whichever array is present or returns an empty array.
 */
function normalizeBooksResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.books)) return data.books;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function ManageBooks() {
  const toast = useToast();
  // Pull library store actions to update global state when books
  // are created, updated or removed.  This ensures other pages
  // reflect changes immediately without requiring a full reload.
  let updateBookInStore, removeBookInStore, addBookToStore;
  try {
    const lib = useLibrary();
    updateBookInStore = lib.updateBook;
    removeBookInStore = lib.removeBook;
    addBookToStore = lib.addBook;
  } catch (e) {
    // In case ManageBooks is rendered outside of LibraryProvider (unlikely),
    // fall back to direct API calls without updating global state.
    updateBookInStore = null;
    removeBookInStore = null;
    addBookToStore = null;
  }
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
    copies_available: "",
    image_url: "",
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
      copies_available: book.copies_available ?? book.stock ?? book.quantity ?? "",
      image_url: book.image_url ?? book.image ?? "",
    });
    setOpen(true);
  }

  async function save() {
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
        copies_available: form.copies_available ? Number(form.copies_available) : undefined,
      };

      if (editing) {
        const id = editing.id ?? editing._id;
        // Attempt to update via LibraryStore first; fallback to direct API
        if (updateBookInStore) {
          const ok = await updateBookInStore(id, payload);
          if (ok) toast.push("Book updated", "success");
          else toast.push("Failed to update book", "error");
        } else {
          await BooksAPI.update(id, payload);
          toast.push("Book updated", "success");
        }
      } else {
        if (addBookToStore) {
          const newId = await addBookToStore({
            title: payload.title,
            author: payload.author,
            category: payload.category,
            stock: payload.copies_available,
          });
          if (newId) toast.push("Book created", "success");
          else toast.push("Failed to create book", "error");
        } else {
          await BooksAPI.create(payload);
          toast.push("Book created", "success");
        }
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
      if (removeBookInStore) {
        const ok = await removeBookInStore(id);
        if (ok) toast.push("Book deleted", "success");
        else toast.push("Failed to delete book", "error");
      } else {
        await BooksAPI.remove(id);
        toast.push("Book deleted", "success");
      }
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
          <Input label="Copies Available" value={form.copies_available} onChange={(e) => setField("copies_available", e.target.value)} />
          <Input 
            label="Image URL" 
            placeholder="https://example.com/image.jpg"
            value={form.image_url} 
            onChange={(e) => setField("image_url", e.target.value)} 
          />
          {form.image_url && (
            <div className="image-preview">
              <img
                src={form.image_url}
                alt="Book Preview"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          <div className="modal-actions">
            <Button variant="primary" onClick={save}>
              {editing ? "Update Book" : "Create Book"}
            </Button>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}