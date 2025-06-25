import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { db } from '../firebase';

function UserList() {
  const [users, setUsers] = useState([]);
  const [editEmail, setEditEmail] = useState(null);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
  });

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const list = snapshot.docs.map(doc => ({
      id: doc.id, // ← זה האימייל
      ...doc.data(),
    }));
    setUsers(list);
  };

  const startEdit = (user) => {
    setEditEmail(user.id);
    setEditData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role || 'user',
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    const ref = doc(db, 'users', editEmail);
    await updateDoc(ref, {
      ...editData,
    });
    setEditEmail(null);
    fetchUsers();
  };

  const handleDelete = async (email) => {

    const confirm = window.confirm(
      `⚠️ אזהרה! ⚠️\n\nאתה עומד למחוק את המשתמש: ${email}\n\nמחיקה זו היא בלתי הפיכה!\nלא ניתן לשחזר את המשתמש לאחר המחיקה.\n\nהאם אתה בטוח שברצונך להמשיך?`
    );

    if (!confirm) return;

    try {
      // שלב 1: מחיקה מה-DB
      await deleteDoc(doc(db, 'users', email));

      // שלב 2: מחיקה מה-Auth (אפשר רק אם המשתמש מחובר)
      // ⚠️ שימו לב: deleteUser() יכול לפעול רק על המשתמש המחובר!
      // בממשק ניהול אמיתי יש להשתמש ב-Firebase Admin SDK בצד שרת.
      // כאן רק נרשום הערה:
      console.warn('כדי למחוק מה-Auth יש צורך בפעולה מהשרת.');

      alert('המשתמש נמחק מה-DB. למחיקה מלאה דרוש Admin SDK.');
      fetchUsers();
    } catch (error) {
      console.error('שגיאה במחיקה:', error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="user-list">
      <h3>רשימת משתמשים</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {editEmail === user.id ? (
              <>
                <input
                  name="firstName"
                  value={editData.firstName}
                  onChange={handleEditChange}
                />
                <input
                  name="lastName"
                  value={editData.lastName}
                  onChange={handleEditChange}
                />
                <input
                  name="phone"
                  value={editData.phone}
                  onChange={handleEditChange}
                />
                <select
                  name="role"
                  value={editData.role}
                  onChange={handleEditChange}
                >
                  <option value="user">משתמש רגיל</option>
                  <option value="admin">מנהל</option>
                </select>
                <button onClick={saveEdit}>שמור</button>
                <button onClick={() => setEditEmail(null)}>ביטול</button>
              </>
            ) : (
              <>
                <strong>{user.firstName} {user.lastName}</strong> ({user.id})
                <button onClick={() => handleDelete(user.id)}>מחק</button>
                <button onClick={() => startEdit(user)}>ערוך</button>
              </>
            )}
          </li>
        ))}
      </ul>

    
    </div>
  );
}

export default UserList;
