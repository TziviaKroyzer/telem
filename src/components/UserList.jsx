import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Pencil, Trash2, Check, X, Unlock } from "lucide-react";
import SelectInput from "./SelectInput";
import { fieldError, phoneDigits } from "../utils/validation";

function UserList() {
  const [users, setUsers] = useState([]);
  const [editEmail, setEditEmail] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", phone: "", role: "user" });
  const [editErrors, setEditErrors] = useState({});
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
    setEditErrors({});
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: name === "phone" ? phoneDigits(value) : value });
  };

  const saveEdit = async () => {
    if (!editEmail) return;
    const next = {
      firstName: fieldError("required", editData.firstName, "שם פרטי"),
      lastName: fieldError("required", editData.lastName, "שם משפחה"),
      phone: editData.phone
        ? fieldError("phone", editData.phone, "טלפון")
        : "",
    };
    setEditErrors(next);
    if (Object.values(next).some(Boolean)) return;
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
      <h2>רשימת משתמשים</h2>

      {users.length === 0 ? (
        <div className="admin-empty">אין משתמשים להצגה</div>
      ) : (
        <ul className="admin-rows">
          {users.map((u) => (
            <li key={u.id} className="admin-row">
              {editEmail === u.id ? (
                <div className="form-grid form-grid--3" style={{ width: "100%" }}>
                  <div>
                    <label>שם פרטי</label>
                    <input className={"input" + (editErrors.firstName ? " is-invalid" : "")} name="firstName" value={editData.firstName} onChange={handleEditChange}/>
                    {editErrors.firstName ? <div className="field-error">{editErrors.firstName}</div> : null}
                  </div>
                  <div>
                    <label>שם משפחה</label>
                    <input className={"input" + (editErrors.lastName ? " is-invalid" : "")} name="lastName" value={editData.lastName} onChange={handleEditChange}/>
                    {editErrors.lastName ? <div className="field-error">{editErrors.lastName}</div> : null}
                  </div>
                  <div>
                    <label>טלפון</label>
                    <input className={"input" + (editErrors.phone ? " is-invalid" : "")} name="phone" inputMode="numeric" placeholder="0501234567" value={editData.phone} onChange={handleEditChange}/>
                    <div className="field-hint">לדוגמה: 0501234567</div>
                    {editErrors.phone ? <div className="field-error">{editErrors.phone}</div> : null}
                  </div>
                  <div>
                    <SelectInput
                      label="תפקיד"
                      value={editData.role}
                      onChange={(role) => setEditData({ ...editData, role })}
                      options={[
                        { value: "user", label: "משתמש רגיל" },
                        { value: "admin", label: "מנהל" },
                      ]}
                    />
                  </div>
                  <div className="admin-actions" style={{ gridColumn: "1 / -1" }}>
                    <button className="admin-icon-btn admin-icon-btn--ok" title="שמירה" aria-label="שמירה" onClick={saveEdit}>
                      <Check size={16} strokeWidth={1.7} />
                    </button>
                    <button className="admin-icon-btn" title="ביטול" aria-label="ביטול" onClick={() => setEditEmail(null)}>
                      <X size={16} strokeWidth={1.7} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-row-main">
                    <span className="admin-row-title">{u.firstName} {u.lastName}</span>
                    <span className="admin-row-sub">
                      {u.id}
                      {u.failedAttempts ? ` · ${u.failedAttempts} ניסיונות כושלים` : ""}
                    </span>
                    {u.locked ? <span className="admin-chip">נעול</span> : null}
                  </div>
                  <div className="admin-actions">
                    <button
                      className="admin-icon-btn"
                      title={u.locked ? "שחרור נעילה" : "המשתמש לא נעול"}
                      aria-label="שחרור נעילה"
                      onClick={() => unlockUser(u.id)}
                      disabled={!u.locked || busy}
                    >
                      <Unlock size={16} strokeWidth={1.6} />
                    </button>
                    <button className="admin-icon-btn" title="עריכה" aria-label="עריכה" onClick={() => startEdit(u)}>
                      <Pencil size={16} strokeWidth={1.6} />
                    </button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="מחיקה" aria-label="מחיקה" onClick={() => handleDelete(u.id)}>
                      <Trash2 size={16} strokeWidth={1.6} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default UserList;
