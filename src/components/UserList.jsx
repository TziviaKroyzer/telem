import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editEmail, setEditEmail] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", phone: "", role: "user" });
  const [busy, setBusy] = useState(false);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const list = snapshot.docs
      .filter((d) => !d.data()?.disabled)
      .map((d) => {
        const data = d.data() || {};
        return {
          id: d.id,
          ...data,
          failedAttempts: data.failedAttempts || 0,
          locked: !!data.locked,
        };
      });
    setUsers(list);
  };

  useEffect(() => { fetchUsers(); }, []);

  const startEdit = (u) => {
    setEditEmail(u.id);
    setEditData({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phone: u.phone || "",
      role: u.role || "user",
    });
  };
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    if (!editEmail) return;
    await updateDoc(doc(db, "users", editEmail), { ...editData });
    setEditEmail(null);
    fetchUsers();
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`למחוק את ${email}? המשתמש לא יוכל להתחבר יותר.`)) return;
    try {
      await updateDoc(doc(db, "users", email), { disabled: true });
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert("שגיאה במחיקת המשתמש.");
    }
  };

  const unlockUser = async (email) => {
    setBusy(true);
    try {
      const ref = doc(db, "users", email);
      const snap = await getDoc(ref);
      if (!snap.exists()) { alert("המשתמש לא נמצא"); return; }
      await updateDoc(ref, { failedAttempts: 0, locked: false });
      await fetchUsers();
      alert(`הנעילה עבור ${email} שוחררה.`);
    } catch (e) {
      console.error(e);
      alert("שגיאה בשחרור נעילה");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <style>{`
        .admin-list{ list-style:none; margin:12px 0 0; padding:0; display:grid; gap:12px; }
        .admin-row{
          background: rgba(255,255,255,.9);
          border:1px solid #e6eef6;
          border-radius:16px;
          padding:12px 16px;
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          box-shadow:0 6px 18px rgba(15,23,42,.06);
          transition: box-shadow .15s ease, transform .12s ease;
        }
        .admin-row:hover{ box-shadow:0 10px 26px rgba(15,23,42,.10); transform: translateY(-1px); }
        .admin-actions{ display:flex; gap:10px; flex-wrap:wrap; }
      `}</style>

      <h2>רשימת משתמשים</h2>

      <ul className="admin-list">
        {users.map((u) => (
          <li key={u.id} className="admin-row">
            {editEmail === u.id ? (
              <div className="form-grid form-grid--3" style={{ width: "100%" }}>
                <div>
                  <label>שם פרטי</label>
                  <input className="input" name="firstName" value={editData.firstName} onChange={handleEditChange}/>
                </div>
                <div>
                  <label>שם משפחה</label>
                  <input className="input" name="lastName" value={editData.lastName} onChange={handleEditChange}/>
                </div>
                <div>
                  <label>טלפון</label>
                  <input className="input" name="phone" value={editData.phone} onChange={handleEditChange}/>
                </div>
                <div>
                  <label>תפקיד</label>
                  <select className="select-input" name="role" value={editData.role} onChange={handleEditChange}>
                    <option value="user">משתמש רגיל</option>
                    <option value="admin">מנהל</option>
                  </select>
                </div>
                <div className="row" style={{ gridColumn: "1 / -1" }}>
                  <button className="btn" onClick={saveEdit}>שמור</button>
                  <button className="btn btn--ghost" onClick={() => setEditEmail(null)}>ביטול</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong>{u.firstName} {u.lastName}</strong> ({u.id})
                  {" · "}ניסיונות כושלים: {u.failedAttempts}
                  {u.locked ? " · 🔒 נעול" : ""}
                </div>
                <div className="admin-actions">
                  <button className="btn btn--danger" onClick={() => handleDelete(u.id)}>מחק</button>
                  <button className="btn" onClick={() => startEdit(u)}>ערוך</button>
                  <button
                    className="btn btn--accent"
                    onClick={() => unlockUser(u.id)}
                    disabled={!u.locked || busy}
                    title={u.locked ? "שחרור נעילה" : "המשתמש לא נעול"}
                  >
                    שחרר נעילה
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default UserList;
