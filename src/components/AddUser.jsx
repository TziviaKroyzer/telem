import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function AddUser() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      const auth = getAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', email), {
        firstName, lastName, phone, role,
        failedAttempts: 0, locked: false,
      });
      setMsg('משתמש נוצר בהצלחה');
      setEmail(''); setPassword(''); setFirstName(''); setLastName(''); setPhone(''); setRole('user');
    } catch (err) {
      console.error(err);
      setMsg('שגיאה ביצירת משתמש');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{marginBottom:'1rem'}}>
      <h2>הוספת משתמש</h2>
      <form onSubmit={handleSubmit} className="form-grid form-grid--2">
        <div>
          <label>שם פרטי</label>
          <input className="input" value={firstName} onChange={e=>setFirstName(e.target.value)} />
        </div>
        <div>
          <label>שם משפחה</label>
          <input className="input" value={lastName} onChange={e=>setLastName(e.target.value)} />
        </div>
        <div>
          <label>אימייל</label>
          <input type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label>סיסמה</label>
          <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div>
          <label>טלפון</label>
          <input className="input" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div>
          <label>תפקיד</label>
          <select className="select-input" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="user">משתמש רגיל</option>
            <option value="admin">מנהל</option>
          </select>
        </div>

        <div className="row" style={{gridColumn:'1 / -1', marginTop:'.25rem'}}>
          <button className="btn" type="submit" disabled={busy}>{busy? "יוצר..." : "הוסף"}</button>
          <span className="muted">{msg}</span>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
