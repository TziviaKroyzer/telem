import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const SearchFilters = ({ onSearch }) => {
  // ערכים שהמשתמש מכניס
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [user, setUser] = useState('');
  const [campus, setCampus] = useState('');
  const [type, setType] = useState('');
  const [text, setText] = useState('');

  // נתונים שנטענים מ-Firestore
  const [usersList, setUsersList] = useState([]);
  const [campusList, setCampusList] = useState([]);
  const [typeList, setTypeList] = useState([]);

  // טוען את האפשרויות מתוך Firebase
  useEffect(() => {
    const fetchOptions = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const campusSnap = await getDocs(collection(db, 'campuses'));
      const typeSnap = await getDocs(collection(db, 'commentType'));

      setUsersList(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCampusList(campusSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTypeList(typeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchOptions();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // שולח את כל ערכי החיפוש לקומפוננטת האב
    onSearch({ fromDate, toDate, user, campus, type, text });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <label>מתאריך:</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </div>

      <div>
        <label>עד תאריך:</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <div>
        <label>משתמש:</label>
        <select value={user} onChange={(e) => setUser(e.target.value)}>
          <option value="">-- בחר --</option>
          {usersList.map(u => (
            <option key={u.email} value={u.email}>{u.username} ({u.email})</option>
          ))}
        </select>
      </div>

      <div>
        <label>קמפוס:</label>
        <select value={campus} onChange={(e) => setCampus(e.target.value)}>
          <option value="">-- בחר --</option>
          {campusList.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>סוג הערה:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">-- בחר --</option>
          {typeList.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>טקסט חופשי:</label>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        חפש
      </button>
    </form>
  );
};

export default SearchFilters;
