import React, { useState } from "react";
import AddCampus from "../components/AddCampus";
import AddHall from "../components/AddHall";
import AddUser from "../components/AddUser";
import CampusList from "../components/CampusList";
import HallList from "../components/HallList";
import UserList from "../components/UserList";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("campus");

  return (
    <div className="admin-page">
      <style>{`
        .admin-page{
          width: min(100%, 980px);
          margin-inline: auto;
          padding: 1.5rem;
        }
        .admin-title{
          font-size: clamp(1.3rem,2.2vw,2rem);
          font-weight: 800;
          margin: 0 0 1rem;
        }
        .admin-tabs{ display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:1rem; }
        .admin-section{ margin-block: 1rem 2rem; }

        /* טופסי הוספה – כרטיס מלא */
        .admin-card{
          background:#fff;
          border:1px solid var(--line, #e2e8f0);
          border-radius:14px;
          box-shadow: var(--shadow-sm, 0 2px 10px rgba(0,0,0,.06));
          padding:1rem;
          margin-bottom:1rem;
        }

        /* עוטף של רשימות כדי לעצב כל שורה בנפרד */
        .admin-list { margin-top:.5rem; }

        /* מבטל bullets ברשימות ומאפס מרווחים */
        .admin-list ul, .admin-list ol { list-style:none; padding:0; margin:0; }

        /* כל שורה ברשימה: כרטיס לבן עם שקיפות קלה */
        .admin-list li,
        .admin-list .list-row,          /* אם שורת פריט היא div עם class */
        .admin-list > div .list-row,    /* וריאציות נפוצות */
        .admin-list .row-item {
          background: rgba(255,255,255, .9);
          border:1px solid #e6eef5;
          border-radius:14px;
          box-shadow: 0 2px 10px rgba(0,0,0,.06);
          padding: 12px 14px;
          margin: 10px 0;
          display:flex;
          align-items:center;
          justify-content: space-between;
          gap:12px;
          backdrop-filter: blur(2px); /* אפקט עדין */
        }

        .admin-list li:hover,
        .admin-list .list-row:hover,
        .admin-list .row-item:hover {
          box-shadow: 0 6px 18px rgba(0,0,0,.10);
        }
      `}</style>

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
      </div>

      {activeTab === "campus" && (
        <section className="admin-section">
          {/* טופס הוספת קמפוס – כרטיס מלא */}
          <div className="admin-card"><AddCampus /></div>

          {/* הרשימה עצמה – כל שורה תהיה לבנה/שקופה בנפרד */}
          <div className="admin-list">
            <CampusList />
          </div>
        </section>
      )}

      {activeTab === "hall" && (
        <section className="admin-section">
          <div className="admin-card"><AddHall /></div>
          <div className="admin-list">
            <HallList />
          </div>
        </section>
      )}

      {activeTab === "user" && (
        <section className="admin-section">
          <div className="admin-card"><AddUser /></div>
          <div className="admin-list">
            <UserList />
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminPanel;
