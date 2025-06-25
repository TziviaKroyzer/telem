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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      // שלב 1: יצירת חשבון ב-Auth
      await createUserWithEmailAndPassword(auth, email, password);

      // שלב 2: שמירת המשתמש במסד הנתונים
      await setDoc(doc(db, 'users', email), {
        email,
        firstName,
        lastName,
        phone,
        role,
      });

      alert('המשתמש נוצר בהצלחה!');
      // איפוס שדות
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setRole('user');
    } catch (error) {
      console.error('שגיאה:', error.message);
      alert('שגיאה: ' + error.message);
    }
  };

  return (
    <div className="add-user">
      <h2>הוספת משתמש חדש</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="שם פרטי"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="שם משפחה"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">משתמש רגיל</option>
          <option value="admin">מנהל</option>
        </select>

        <button type="submit">הוסף</button>
      </form>

      <style>{`
        .add-user {
          max-width: 400px;
          margin: auto;
          padding: 20px;
        }

        .add-user form {
          display: flex;
          flex-direction: column;
        }

        .add-user input,
        .add-user select {
          margin-bottom: 10px;
          padding: 8px;
          font-size: 16px;
        }

        .add-user button {
          padding: 10px;
          background-color: darkgreen;
          color: white;
          font-weight: bold;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default AddUser;
