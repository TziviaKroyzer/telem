import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function AddHall() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [campusId, setCampusId] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [campuses, setCampuses] = useState([]);
  const [users, setUsers] = useState([]);

  // הבאת קמפוסים ומשתמשים מה-Firestore
  useEffect(() => {
    const fetchData = async () => {
      const campusSnapshot = await getDocs(collection(db, 'campuses'));
      const campusList = [];
      campusSnapshot.forEach((doc) => {
        campusList.push({ id: doc.id, ...doc.data() });
      });
      setCampuses(campusList);

      const userSnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      userSnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'halls'), {
        name,
        address,
        campus: `/campuses/${campusId}`,
        contactPersonId: contactPerson,
      });
      alert('אולם נוסף בהצלחה!');
      setName('');
      setAddress('');
      setCampusId('');
      setContactPerson('');
    } catch (error) {
      console.error('שגיאה בהוספה:', error);
    }
  };

  return (
    <div className="add-hall">
      <h2>הוספת אולם חדש</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="שם אולם"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="כתובת"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <select
          value={campusId}
          onChange={(e) => setCampusId(e.target.value)}
        >
          <option value="">בחר קמפוס</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name}
            </option>
          ))}
        </select>

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

export default AddHall;
