import React, { useEffect, useMemo, useState } from "react";
import "./Members.css";
import { UserAPI } from "../../api/endpoints";
import { normalizeError } from "../../api/client";

export default function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

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

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Hapus member "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setDeleting(userId);
    try {
      await UserAPI.delete(userId);
      setUsers(users.filter((u) => (u.id || u._id) !== userId));
    } catch (e) {
      console.error("Failed to delete user", normalizeError(e));
      alert("Gagal menghapus member: " + normalizeError(e));
    } finally {
      setDeleting(null);
    }
  };

  const getMemberInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColorClass = (index) => {
    const classes = ["avatar-purple", "avatar-pink", "avatar-cyan", "avatar-green", "avatar-orange", "avatar-blue"];
    return classes[index % classes.length];
  };

  return (
    <div className="membersWrap">
      {/* Header Section */}
      <div className="membersHeader">
        <div className="membersHeaderInner">
          <div>
            <h1 className="membersHeaderTitle">Members</h1>
            <p className="membersHeaderSub">
              Total {filtered.length} anggota perpustakaan
            </p>
          </div>
          <div className="membersViewToggle">
            <button
              onClick={() => setViewMode("grid")}
              className={`viewBtn ${viewMode === "grid" ? "active" : ""}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`viewBtn ${viewMode === "list" ? "active" : ""}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="membersSearch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="membersSearchIcon">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          placeholder="Cari nama, email, atau ID..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="membersSearchInput"
        />
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="membersLoading">
          <div className="membersSpinner" />
          <div className="membersLoadingText">Memuat data...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="membersEmpty">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="membersEmptyIcon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <div className="membersEmptyText">Tidak ada member yang ditemukan</div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="membersGrid">
          {filtered.map((u, idx) => (
            <div key={u.id || u._id} className="memberCard">
              <div className="memberCardAvatar">
                <div className={`memberAvatar ${getAvatarColorClass(idx)}`}>
                  {getMemberInitials(u.name || "?")}
                </div>
              </div>

              <div className="memberCardInfo">
                <h3 className="memberCardName">{u.name || "-"}</h3>
                <p className="memberCardEmail">{u.email || "-"}</p>
              </div>

              <div className="memberCardRole">
                <span className={`memberRole ${(u.role || "").toLowerCase() === "librarian" ? "librarian" : "member"}`}>
                  {(u.role || "").toLowerCase() === "librarian" ? "Librarian" : "Member"}
                </span>
              </div>

              <button
                onClick={() => handleDelete(u.id || u._id, u.name)}
                disabled={deleting !== null}
                className="memberDeleteBtn"
              >
                {deleting === (u.id || u._id) ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="membersList">
          <div className="membersListHead">
            <div>Member</div>
            <div>Email</div>
            <div style={{ textAlign: "center" }}>Role</div>
            <div style={{ textAlign: "center" }}>Aksi</div>
          </div>

          {filtered.map((u, idx) => (
            <div key={u.id || u._id} className="membersListRow">
              <div className="membersListMember">
                <div className={`memberAvatarSmall ${getAvatarColorClass(idx)}`}>
                  {getMemberInitials(u.name || "?")}
                </div>
                <span className="membersListName">{u.name || "-"}</span>
              </div>

              <div className="membersListEmail">{u.email || "-"}</div>

              <div className="membersListRoleCol">
                <span className={`memberRoleTag ${(u.role || "").toLowerCase() === "librarian" ? "librarian" : "member"}`}>
                  {(u.role || "").toLowerCase() === "librarian" ? "Librarian" : "Member"}
                </span>
              </div>

              <div className="membersListAction">
                <button
                  onClick={() => handleDelete(u.id || u._id, u.name)}
                  disabled={deleting !== null}
                  className="memberDeleteBtnList"
                >
                  {deleting === (u.id || u._id) ? "..." : "Hapus"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
