import React, { useState } from "react";
import AddCampus from "../components/AddCampus";
import AddHall from "../components/AddHall";
import AddUser from "../components/AddUser";
import CampusList from "../components/CampusList";
import HallList from "../components/HallList";
import UserList from "../components/UserList";
import DeleteCommentsByDate from "../components/DeleteCommentsByDate"; // חדש

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("campus");

  return (
    <div className="admin-page">
      {/* ... style ... */}
      <h1 className="admin-title">ניהול מערכת</h1>
      <div className="admin-tabs">
        <button
          className={"btn " + (activeTab === "campus" ? "" : "btn--ghost")}
          onClick={() => setActiveTab("campus")}
        >
          קמפוסים
        </button>
        <button
          className={"btn " + (activeTab === "hall" ? "" : "btn--ghost")}
          onClick={() => setActiveTab("hall")}
        >
          אולמות
        </button>
        <button
          className={"btn " + (activeTab === "user" ? "" : "btn--ghost")}
          onClick={() => setActiveTab("user")}
        >
          משתמשים
        </button>
        {/* טאאב חדש – ניהול נתונים */}
        <button
          className={"btn " + (activeTab === "data" ? "" : "btn--ghost")}
          onClick={() => setActiveTab("data")}
        >
          ניהול נתונים
        </button>
      </div>

      {activeTab === "campus" && (
        <section className="admin-section">
          <div className="admin-card"><AddCampus /></div>
          <div className="admin-list"><CampusList /></div>
        </section>
      )}
      {activeTab === "hall" && (
        <section className="admin-section">
          <div className="admin-card"><AddHall /></div>
          <div className="admin-list"><HallList /></div>
        </section>
      )}
      {activeTab === "user" && (
        <section className="admin-section">
          <div className="admin-card"><AddUser /></div>
          <div className="admin-list"><UserList /></div>
        </section>
      )}
      {/* טאאב חדש – ניהול נתונים*/}
      {activeTab === "data" && (
        <section className="admin-section">
          {/* אפשר לשים כאן כמה כרטיסים – כרגע רק מחיקת הערות */}
          <DeleteCommentsByDate />
        </section>
      )}
    </div>
  );
}

export default AdminPanel;
