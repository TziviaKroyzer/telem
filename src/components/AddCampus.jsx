import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function AddCampus() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [users, setUsers] = useState([]);

  // שלב 1: הבאת המשתמשים מה-Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  // שלב 2: שליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'campuses'), {
        name,
        address,
        ContactPerson: `/users/${contactPerson}`,
      });
      alert('קמפוס נוסף בהצלחה!');
      setName('');
      setAddress('');
      setContactPerson('');
    } catch (error) {
      console.error('שגיאה בהוספה:', error);
    }
  };

  return (
    <div className="add-campus">
      <h2>הוספת קמפוס חדש</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="שם קמפוס"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="כתובת"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* תיבת בחירה של המשתמשים */}
        <select
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
        >
          <option value="">בחר אחראי</option>
          {users.map((user) => (
            <option key={user.email} value={user.email}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>

        <button type="submit">הוסף</button>
      </form>

     
    </div>
  );
}

export default AddCampus;
