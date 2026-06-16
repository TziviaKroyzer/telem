import React, { useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const firebaseConfig = {
  apiKey: "AIzaSyCojHEmBzwWBvD_UbiJutLHn8lqtJD0zBU",
  authDomain: "telem-8ad5a.firebaseapp.com",
  projectId: "telem-8ad5a",
  storageBucket: "telem-8ad5a.firebasestorage.app",
  messagingSenderId: "608127468542",
  appId: "1:608127468542:web:b761d856cb352644c2b6af",
};

function getSecondaryAuth() {
  const secondaryApp = getApps().find(a => a.name === 'SecondaryApp')
    ?? initializeApp(firebaseConfig, 'SecondaryApp');
  return getAuth(secondaryApp);
}

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
    const secondaryAuth = getSecondaryAuth();
    try {
      await createUserWithEmailAndPassword(secondaryAuth, email, password);
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
      await signOut(secondaryAuth).catch(() => {});
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
