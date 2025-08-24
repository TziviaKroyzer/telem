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
    <div className="card">
      <h2>רשימת קמפוסים קיימים</h2>

      <ul className="stack" style={{ marginTop: "12px" }}>
        {campuses.map((c) => (
          <li key={c.id} className="card" style={{ padding: "12px" }}>
            {editId === c.id ? (
              <div className="form-grid form-grid--3">
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
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{c.name}</strong>
                  {c.address ? ` · ${c.address}` : ""}
                </div>
                <div className="row">
                  <button className="btn" onClick={() => startEdit(c)}>ערוך</button>
                  <button className="btn btn--danger" onClick={() => remove(c.id)}>מחק</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CampusList;
