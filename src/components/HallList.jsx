import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function HallList() {
  const [halls, setHalls] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", address: "" });

  const fetchHalls = async () => {
    const snap = await getDocs(collection(db, "halls"));
    setHalls(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };
  useEffect(() => { fetchHalls(); }, []);

  const startEdit = (h) => { setEditId(h.id); setEditData({ name: h.name || "", address: h.address || "" }); };
  const handleEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    await updateDoc(doc(db, "halls", editId), { ...editData });
    setEditId(null);
    fetchHalls();
  };

  const remove = async (id) => {
    if (!window.confirm("למחוק את האולם?")) return;
    await deleteDoc(doc(db, "halls", id));
    fetchHalls();
  };

  return (
    <section>
      <h2>רשימת אולמות קיימים</h2>

      {halls.length === 0 ? (
        <div className="admin-empty">אין אולמות להצגה</div>
      ) : (
        <ul className="admin-rows">
          {halls.map((h) => (
            <li key={h.id} className="admin-row">
              {editId === h.id ? (
                <div className="form-grid form-grid--3" style={{ width: "100%" }}>
                  <div>
                    <label>שם</label>
                    <input className="input" name="name" value={editData.name} onChange={handleEditChange}/>
                  </div>
                  <div>
                    <label>כתובת</label>
                    <input className="input" name="address" value={editData.address} onChange={handleEditChange}/>
                  </div>
                  <div className="admin-actions" style={{ alignItems: "end" }}>
                    <button className="admin-icon-btn admin-icon-btn--ok" title="שמירה" aria-label="שמירה" onClick={saveEdit}>
                      <Check size={16} strokeWidth={1.7} />
                    </button>
                    <button className="admin-icon-btn" title="ביטול" aria-label="ביטול" onClick={() => setEditId(null)}>
                      <X size={16} strokeWidth={1.7} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-row-main">
                    <span className="admin-row-title">{h.name}</span>
                    {h.address ? <span className="admin-row-sub">{h.address}</span> : null}
                  </div>
                  <div className="admin-actions">
                    <button className="admin-icon-btn" title="עריכה" aria-label="עריכה" onClick={() => startEdit(h)}>
                      <Pencil size={16} strokeWidth={1.6} />
                    </button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="מחיקה" aria-label="מחיקה" onClick={() => remove(h.id)}>
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
