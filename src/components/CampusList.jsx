import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Pencil, Trash2, Check, X } from "lucide-react";

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
      <h2>רשימת קמפוסים קיימים</h2>

      {campuses.length === 0 ? (
        <div className="admin-empty">אין קמפוסים להצגה</div>
      ) : (
        <ul className="admin-rows">
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
                    <span className="admin-row-title">{c.name}</span>
                    {c.address ? <span className="admin-row-sub">{c.address}</span> : null}
                  </div>
                  <div className="admin-actions">
                    <button className="admin-icon-btn" title="עריכה" aria-label="עריכה" onClick={() => startEdit(c)}>
                      <Pencil size={16} strokeWidth={1.6} />
                    </button>
                    <button className="admin-icon-btn admin-icon-btn--danger" title="מחיקה" aria-label="מחיקה" onClick={() => remove(c.id)}>
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

export default CampusList;
