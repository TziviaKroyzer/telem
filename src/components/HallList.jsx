// src/components/HallList.jsx
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
    setEditId(null); fetchHalls();
  };
  const remove = async (id) => {
    if (!window.confirm("למחוק את האולם?")) return;
    await deleteDoc(doc(db, "halls", id)); fetchHalls();
  };

  return (
    <div className="card">
      <h2>רשימת אולמות קיימים</h2>
      <ul className="stack" style={{ marginTop: "12px" }}>
        {halls.map((h) => (
          <li key={h.id} className="card" style={{ padding: "12px" }}>
            {editId === h.id ? (
              <div className="form-grid form-grid--3">
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
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div><strong>{h.name}</strong>{h.address ? ` · ${h.address}` : ""}</div>
                <div className="row">
                  <button className="btn" onClick={() => startEdit(h)}>ערוך</button>
                  <button className="btn btn--danger" onClick={() => remove(h.id)}>מחק</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
