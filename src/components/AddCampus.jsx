import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

function AddCampus() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState(""); // אימייל של אחראי
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const qs = await getDocs(collection(db, "users"));
      const list = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("נא למלא שם קמפוס");

    await addDoc(collection(db, "campuses"), {
      name: name.trim(),
      address: address.trim(),
      contactPerson: contactPerson || null, // שמרי אימייל/ID לפי מה שמתאים לך
    });

    setName("");
    setAddress("");
    setContactPerson("");
    alert("קמפוס נוסף בהצלחה");
  };

  return (
    <div className="card">
      <h2>הוספת קמפוס חדש</h2>
      <form onSubmit={onSubmit} className="form-grid form-grid--3" style={{ marginTop: ".5rem" }}>
        <div>
          <label>שם קמפוס</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label>כתובת</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label>בחר אחראי</label>
          <select
            className="select-input"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          >
            <option value="">— ללא —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {(u.firstName ? `${u.firstName} ` : "") + (u.lastName || u.id)}
              </option>
            ))}
          </select>
        </div>

        <div className="row" style={{ gridColumn: "1 / -1" }}>
          <button className="btn btn--accent" type="submit">
            הוסף
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCampus;
