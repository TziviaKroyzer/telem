import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

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
      {/* סגנון מקומי לשורות לבנות חצי-שקופות */}
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

      <h2>רשימת אולמות קיימים</h2>

      <ul className="admin-list">
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
                <div className="row" style={{ alignItems: "end" }}>
                  <button className="btn" onClick={saveEdit}>שמור</button>
                  <button className="btn btn--ghost" onClick={() => setEditId(null)}>ביטול</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong>{h.name}</strong>{h.address ? ` · ${h.address}` : ""}
                </div>
                <div className="admin-actions">
                  <button className="btn" onClick={() => startEdit(h)}>ערוך</button>
                  <button className="btn btn--danger" onClick={() => remove(h.id)}>מחק</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
