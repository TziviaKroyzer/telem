import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function CampusList() {
  const [campuses, setCampuses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", address: "" });

  const fetchCampuses = async () => {
    const snapshot = await getDocs(collection(db, "campuses"));
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCampuses(list);
  };

  useEffect(() => { fetchCampuses(); }, []);

  const startEdit = (c) => {
    setEditId(c.id);
    setEditData({ name: c.name || "", address: c.address || "" });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    await updateDoc(doc(db, "campuses", editId), { ...editData });
    setEditId(null);
    fetchCampuses();
  };

  const remove = async (id) => {
    if (!window.confirm("למחוק את הקמפוס?")) return;
    await deleteDoc(doc(db, "campuses", id));
    fetchCampuses();
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

      <h2>רשימת קמפוסים קיימים</h2>

      <ul className="admin-list">
        {campuses.map((c) => (
          <li key={c.id} className="admin-row">
            {editId === c.id ? (
              <div className="form-grid form-grid--3" style={{ width: "100%" }}>
                <div>
                  <label>שם</label>
                  <input
                    className="input"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                  />
                </div>
                <div>
                  <label>כתובת</label>
                  <input
                    className="input"
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="row" style={{ alignItems: "end" }}>
                  <button className="btn" onClick={saveEdit}>שמור</button>
                  <button className="btn btn--ghost" onClick={() => setEditId(null)}>ביטול</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <strong>{c.name}</strong>
                  {c.address ? ` · ${c.address}` : ""}
                </div>
                <div className="admin-actions">
                  <button className="btn" onClick={() => startEdit(c)}>ערוך</button>
                  <button className="btn btn--danger" onClick={() => remove(c.id)}>מחק</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default CampusList;
