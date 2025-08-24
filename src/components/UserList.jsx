import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editEmail, setEditEmail] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", phone: "", role: "user" });
  const [busy, setBusy] = useState(false);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const list = snapshot.docs.map((d) => {
      const data = d.data() || {};
      return {
        id: d.id, // האימייל הוא ה-ID
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
    if (!window.confirm(`למחוק את ${email}?`)) return;
    await deleteDoc(doc(db, "users", email));
    fetchUsers();
    alert("המשתמש נמחק מה-DB. למחיקה מ-Auth יש צורך ב-Admin SDK בצד שרת.");
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
    <div className="card">
      <h2>רשימת משתמשים</h2>
      <ul className="stack" style={{ marginTop: "12px" }}>
        {users.map((u) => (
          <li key={u.id} className="card" style={{ padding: "12px" }}>
            {editEmail === u.id ? (
              <div className="form-grid form-grid--3">
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
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{u.firstName} {u.lastName}</strong> ({u.id})
                  {" · "}ניסיונות כושלים: {u.failedAttempts}
                  {u.locked ? " · 🔒 נעול" : ""}
                </div>
                <div className="row">
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
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
