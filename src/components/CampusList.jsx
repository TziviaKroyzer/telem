import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function CampusList() {
  const [campuses, setCampuses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', address: '' });

  const fetchCampuses = async () => {
    const snapshot = await getDocs(collection(db, 'campuses'));
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCampuses(list);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('את בטוחה שתרצי למחוק את הקמפוס?');
    if (!confirm) return;

    await deleteDoc(doc(db, 'campuses', id));
    fetchCampuses();
  };

  const startEdit = (campus) => {
    setEditId(campus.id);
    setEditData({ name: campus.name, address: campus.address });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    const campusRef = doc(db, 'campuses', editId);
    await updateDoc(campusRef, {
      name: editData.name,
      address: editData.address,
    });
    setEditId(null);
    fetchCampuses();
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  return (
    <div className="campus-list">
      <h3>רשימת קמפוסים קיימים</h3>
      <ul>
        {campuses.map((campus) => (
          <li key={campus.id}>
            {editId === campus.id ? (
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
                <strong>{campus.name}</strong> - {campus.address}
                <button onClick={() => handleDelete(campus.id)}>מחק</button>
                <button onClick={() => startEdit(campus)}>ערוך</button>
              </>
            )}
          </li>
        ))}
      </ul>

      
    </div>
  );
}

export default CampusList;
