import React, { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../firebase';
import SelectInput from './SelectInput';
import { fieldError, phoneDigits } from '../utils/validation';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';

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
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {
      firstName: fieldError("required", firstName, "שם פרטי"),
      lastName: fieldError("required", lastName, "שם משפחה"),
      email: fieldError("email", email, "אימייל"),
      password: fieldError("password", password, "סיסמה"),
      phone: fieldError("phone", phone, "טלפון"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setMsg("");
      return;
    }

    setMsg('');
    setBusy(true);
    const secondaryAuth = getSecondaryAuth();
    try {
      await createUserWithEmailAndPassword(secondaryAuth, email.trim(), password);
      await setDoc(doc(db, 'users', email.trim()), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phoneDigits(phone),
        role,
        failedAttempts: 0, locked: false,
      });
      setMsg('משתמש נוצר בהצלחה');
      setErrors({});
      setEmail(''); setPassword(''); setFirstName(''); setLastName(''); setPhone(''); setRole('user');
    } catch (err) {
      console.error(err);
      setMsg(getFirebaseErrorMessage(err));
    } finally {
      await signOut(secondaryAuth).catch(() => {});
      setBusy(false);
    }
  };

  return (
    <>
      <h2>הוספת משתמש</h2>
      <form onSubmit={handleSubmit} className="form-grid form-grid--2" noValidate>
        <div>
          <label>שם פרטי</label>
          <input className={"input" + (errors.firstName ? " is-invalid" : "")} placeholder="לדוגמה: דינה" value={firstName} onChange={e=>setFirstName(e.target.value)} />
          {errors.firstName ? <div className="field-error">{errors.firstName}</div> : null}
        </div>
        <div>
          <label>שם משפחה</label>
          <input className={"input" + (errors.lastName ? " is-invalid" : "")} placeholder="לדוגמה: פיגר" value={lastName} onChange={e=>setLastName(e.target.value)} />
          {errors.lastName ? <div className="field-error">{errors.lastName}</div> : null}
        </div>
        <div>
          <label>אימייל</label>
          <input type="email" dir="ltr" className={"input" + (errors.email ? " is-invalid" : "")} placeholder="name@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <div className="field-hint">ישמש גם כשם המשתמש להתחברות</div>
          {errors.email ? <div className="field-error">{errors.email}</div> : null}
        </div>
        <div>
          <label>סיסמה</label>
          <input type="password" className={"input" + (errors.password ? " is-invalid" : "")} placeholder="לפחות 6 תווים" value={password} onChange={e=>setPassword(e.target.value)} />
          <div className="field-hint">לפחות 6 תווים</div>
          {errors.password ? <div className="field-error">{errors.password}</div> : null}
        </div>
        <div>
          <label>טלפון</label>
          <input
            className={"input" + (errors.phone ? " is-invalid" : "")}
            inputMode="numeric"
            placeholder="0501234567"
            value={phone}
            onChange={e=>setPhone(phoneDigits(e.target.value))}
          />
          <div className="field-hint">לדוגמה: 0501234567  ספרות בלבד, 9–10 תווים</div>
          {errors.phone ? <div className="field-error">{errors.phone}</div> : null}
        </div>
        <div>
          <SelectInput
            label="תפקיד"
            value={role}
            onChange={setRole}
            hint="משתמש רגיל או מנהל מערכת"
            options={[
              { value: "user", label: "משתמש רגיל" },
              { value: "admin", label: "מנהל" },
            ]}
          />
        </div>

        <div className="row" style={{gridColumn:'1 / -1', marginTop:'.25rem'}}>
          <button className="btn btn--accent" type="submit" disabled={busy}>{busy? "יוצר..." : "הוסף"}</button>
          <span className="muted">{msg}</span>
        </div>
      </form>
    </>
  );
}

export default AddUser;
