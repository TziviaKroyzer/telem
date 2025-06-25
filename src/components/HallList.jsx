import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function HallList() {
  const [halls, setHalls] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', address: '' });

  const fetchHalls = async () => {
    const snapshot = await getDocs(collection(db, 'halls'));
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setHalls(list);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('את בטוחה שתרצי למחוק את האולם?');
    if (!confirm) return;

    await deleteDoc(doc(db, 'halls', id));
    fetchHalls();
  };

  const startEdit = (hall) => {
    setEditId(hall.id);
    setEditData({ name: hall.name, address: hall.address });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    const hallRef = doc(db, 'halls', editId);
    await updateDoc(hallRef, {
      name: editData.name,
      address: editData.address,
    });
    setEditId(null);
    fetchHalls();
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  return (
    <div className="hall-list">
      <h3>רשימת אולמות קיימים</h3>
      <ul>
        {halls.map((hall) => (
          <li key={hall.id}>
            {editId === hall.id ? (
              <>
                <input
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                />
                <input
                  name="address"
                  value={editData.address}
                  onChange={handleEditChange}
                />
                <button onClick={saveEdit}>שמור</button>
                <button onClick={() => setEditId(null)}>ביטול</button>
              </>
            ) : (
              <>
                <strong>{hall.name}</strong> - {hall.address}
                <button onClick={() => handleDelete(hall.id)}>מחק</button>
                <button onClick={() => startEdit(hall)}>ערוך</button>
              </>
            )}
          </li>
        ))}
      </ul>

      
    </div>
  );
}

export default HallList;
