// src/components/AddHall.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import SelectInput from "./SelectInput";
import { fieldError } from "../utils/validation";

export default function AddHall() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [campusId, setCampusId] = useState("");
  const [campuses, setCampuses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      const qs = await getDocs(collection(db, "campuses"));
      setCampuses(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = { name: fieldError("required", name, "שם אולם") };
    setErrors(next);
    if (next.name) {
      setMsg("");
      return;
    }
    setMsg("");
    setBusy(true);
    try {
      await addDoc(collection(db, "halls"), {
        name: name.trim(),
        address: address.trim() || null,
        campus: campusId ? `/campuses/${campusId}` : null,
      });

      setName("");
      setAddress("");
      setCampusId("");
      setErrors({});
      setMsg("האולם נוסף בהצלחה");
    } catch (err) {
      console.error(err);
      setMsg("שגיאה בהוספת אולם");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h2>הוספת אולם חדש</h2>
      <form onSubmit={onSubmit} className="form-grid form-grid--3" style={{ marginTop: ".5rem" }}>
        <div>
          <label>שם אולם</label>
          <input className={"input" + (errors.name ? " is-invalid" : "")} placeholder="לדוגמה: אולם ג" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name ? <div className="field-error">{errors.name}</div> : null}
        </div>
        <div>
          <label>כתובת</label>
          <input className="input" placeholder="מיקום (לא חובה)" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <SelectInput
            label="קמפוס"
            allowEmpty
            placeholder="בחר קמפוס"
            value={campusId}
            onChange={setCampusId}
            options={campuses.map((c) => ({ value: c.id, label: c.name || c.id }))}
          />
        </div>
        <div className="row" style={{ gridColumn: "1 / -1" }}>
          <button className="btn btn--accent" type="submit" disabled={busy}>
            {busy ? "מוסיף..." : "הוסף"}
          </button>
          <span className="muted">{msg}</span>
        </div>
      </form>
    </>
  );
}
