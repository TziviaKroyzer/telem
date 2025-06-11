import React, { useState } from 'react';
import AddCampus from '../components/AddCampus';
import AddHall from '../components/AddHall';
import AddUser from '../components/AddUser';
import CampusList from '../components/CampusList';
import HallList from '../components/HallList';
import UserList from '../components/UserList';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('campus');

  return (
    <div className="admin-panel">
      <h1>ניהול מערכת</h1>

      <div className="tabs">
        <button onClick={() => setActiveTab('campus')}>הוסף קמפוס</button>
        <button onClick={() => setActiveTab('hall')}>הוסף אולם</button>
        <button onClick={() => setActiveTab('user')}>הוסף משתמש</button>
      </div>

      <div className="form-container">
        {activeTab === 'campus' && (
          <>
            <AddCampus />
            <CampusList />
          </>
        )}
        {activeTab === 'hall' && (
          <>
            <AddHall />
            <HallList />
          </>
        )}

        {activeTab === 'user' && (
          <>
            <AddUser />
            <UserList />
          </>
        )}

      </div>

      <style>{`
        .admin-panel {
          text-align: center;
          padding: 30px;
        }

        .tabs {
          margin-bottom: 20px;
        }

        .tabs button {
          margin: 0 10px;
          padding: 10px 20px;
          font-size: 16px;
          background-color: #007b8f;
          color: white;
          border: none;
          cursor: pointer;
          border-radius: 8px;
        }

        .tabs button:hover {
          background-color: #005f6b;
        }

        .form-container {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}

export default AdminPanel;
