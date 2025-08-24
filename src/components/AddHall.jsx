// src/components/AddHall.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function AddHall() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [campusId, setCampusId] = useState("");
  const [campuses, setCampuses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const qs = await getDocs(collection(db, "campuses"));
      setCampuses(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setBusy(true);
    try {
      if (!name.trim()) return setMsg("נא למלא שם אולם");

      await addDoc(collection(db, "halls"), {
        name: name.trim(),
        address: address.trim() || null,
        campus: campusId ? `/campuses/${campusId}` : null,
      });

      setName(""); setAddress(""); setCampusId("");
      setMsg("האולם נוסף בהצלחה");
    } catch (err) {
      console.error(err);
      setMsg("שגיאה בהוספת אולם");
    } finally { setBusy(false); }
  };

  return (
    <div className="card">
      <h2>הוספת אולם חדש</h2>
      <form onSubmit={onSubmit} className="form-grid form-grid--3" style={{ marginTop: ".5rem" }}>
        <div>
          <label>שם אולם</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>כתובת</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label>קמפוס</label>
          <select className="select-input" value={campusId} onChange={(e) => setCampusId(e.target.value)}>
            <option value="">— בחר קמפוס —</option>
            {campuses.map((c) => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
          </select>
        </div>
        <div className="row" style={{ gridColumn: "1 / -1" }}>
          <button className="btn btn--accent" type="submit" disabled={busy}>
            {busy ? "מוסיף..." : "הוסף"}
          </button>
          <span className="muted">{msg}</span>
        </div>
      </form>
    </div>
  );
}
