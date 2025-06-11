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

      <style>{`
        .hall-list {
          margin-top: 30px;
          max-width: 500px;
          margin-inline: auto;
          text-align: right;
        }

        .hall-list ul {
          list-style: none;
          padding: 0;
        }

        .hall-list li {
          background: #f9f9f9;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }

        .hall-list button {
          margin-right: 10px;
          background-color: darkorange;
          color: white;
          border: none;
          padding: 5px 10px;
          cursor: pointer;
        }

        .hall-list button:hover {
          background-color: orangered;
        }

        .hall-list input {
          margin-left: 5px;
          padding: 5px;
        }
      `}</style>
    </div>
  );
}

export default HallList;
