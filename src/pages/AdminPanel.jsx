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
    <div className="stack" style={{gap:'1rem'}}>
      <h1>ניהול מערכת</h1>

      <div className="row">
        <button className={"btn " + (activeTab==='campus'?'':'btn--ghost')} onClick={()=>setActiveTab('campus')}>קמפוסים</button>
        <button className={"btn " + (activeTab==='hall'?'':'btn--ghost')} onClick={()=>setActiveTab('hall')}>אולמות</button>
        <button className={"btn " + (activeTab==='user'?'':'btn--ghost')} onClick={()=>setActiveTab('user')}>משתמשים</button>
      </div>

      {activeTab === 'campus' && (
        <div className="stack">
          <div className="card"><AddCampus /></div>
          <div className="card"><CampusList /></div>
        </div>
      )}

      {activeTab === 'hall' && (
        <div className="stack">
          <div className="card"><AddHall /></div>
          <div className="card"><HallList /></div>
        </div>
      )}

      {activeTab === 'user' && (
        <div className="stack">
          <AddUser />
          <UserList />
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
