import React, { useEffect, useMemo, useState } from "react";
import { UserAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";

// Members page displays a list of registered users.  It fetches data
// from the backend via /api/users and provides a simple search
// interface.  Roles are displayed as Member or Librarian.
export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await UserAPI.list();
        const data = res.data?.data || res.data?.users || res.data || [];
        if (alive) setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load users", normalizeError(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      (u.name || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s) ||
      String(u.id || "").toLowerCase().includes(s)
    );
  }, [users, q]);

  return (
    <div className="panel">
      <div className="panelHead">
        <div className="panelTitle">Members</div>
        <div className="invSearch">
          <span className="invSearchIcon">🔎</span>
          <input
            className="invSearchInput"
            placeholder="Search by name, email, or ID..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <div className="panelBody">
        {loading ? (
          <div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="invEmpty">No members found.</div>
        ) : (
          <div className="table">
            <div className="txHead">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
            </div>
            {filtered.map((u) => (
              <div className="txRow" key={u.id || u._id}>
                <div className="txCell">{u.name || "-"}</div>
                <div className="txCell">{u.email || "-"}</div>
                <div className="txCell">{(u.role || '').toLowerCase() === 'librarian' ? 'Librarian' : 'Member'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
