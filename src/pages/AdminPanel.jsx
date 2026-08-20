import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import AddCampus from "../components/AddCampus";
import AddHall from "../components/AddHall";
import AddUser from "../components/AddUser";
import CampusList from "../components/CampusList";
import HallList from "../components/HallList";
import UserList from "../components/UserList";
import DeleteCommentsByDate from "../components/DeleteCommentsByDate"; // חדש

const TABS = [
  { id: "campus", label: "קמפוסים", collection: "campuses" },
  { id: "hall", label: "אולמות", collection: "halls" },
  { id: "user", label: "משתמשים", collection: "users" },
  { id: "data", label: "ניהול נתונים", collection: null },
];

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("campus");
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setIsAdmin(false);
        setAuthChecked(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.email));
        setIsAdmin(snap.exists() && snap.data()?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const entries = await Promise.all(
        TABS.filter((t) => t.collection).map(async (t) => {
          try {
            const snap = await getDocs(collection(db, t.collection));
            return [t.id, snap.size];
          } catch {
            return [t.id, null];
          }
        })
      );
      setCounts(Object.fromEntries(entries));
    })();
  }, [isAdmin]);

  if (!authChecked) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="admin-page">
      <style>{`
        .admin-page {
          width: 100%;
          margin: 0 auto;
          padding: 0;
          direction: rtl;
          text-align: right;
        }

        .admin-hero { padding-bottom: 4px; }

        .admin-title {
          margin: 0 0 22px;
          font-family: "Heebo", var(--font-sans);
          font-weight: 900;
          font-size: clamp(1.6rem, 4.5vw, 2.2rem);
          letter-spacing: -.8px;
          color: #12203A;
        }

        .admin-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .admin-tab {
          background: #fff;
          border: 1.5px solid #EDE9E3;
          cursor: pointer;
          padding: .5rem 1.1rem;
          min-height: 42px;
          font-family: inherit;
          font-weight: 700;
          font-size: .86rem;
          color: #8A8272;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background .15s, color .15s, border-color .15s;
        }

        .admin-tab--active {
          background: #12203A;
          border-color: #12203A;
          color: #fff;
        }

        .admin-tab-count {
          font-size: .75rem;
          font-weight: 800;
          color: #C9C3B7;
          background: #F4F2ED;
          border-radius: 999px;
          padding: 2px 8px;
        }
        .admin-tab--active .admin-tab-count {
          color: #fff;
          background: rgba(255,255,255,.16);
        }

        .admin-section { margin: 0 0 2rem; }

        .admin-card {
          background: #FFFEFB;
          border: 1px solid #EDE9E3;
          border-radius: 24px;
          box-shadow: 0 8px 24px rgba(18,32,58,.05);
          padding: 22px 24px;
          margin-bottom: 18px;
          overflow: visible;
        }

        .admin-page h2 {
          margin: 0 0 16px;
          font-size: 1.05rem;
          font-weight: 800;
          color: #12203A;
          letter-spacing: -.2px;
        }

        .admin-page .input {
          border-radius: 14px;
          background: #FBFAF8;
        }

        .admin-page .muted { font-size: .88rem; }

        .admin-list-wrap { margin-top: 4px; }

        .admin-rows {
          list-style: none;
          margin: 0;
          padding: 0;
          background: #fff;
          border: 1px solid #EDE9E3;
          border-radius: 24px;
          overflow: visible;
        }

        .admin-row {
          background: transparent;
          border: 0;
          border-bottom: 1px solid #F2EFE9;
          border-radius: 0;
          box-shadow: none;
          padding: 16px 20px;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .admin-row:last-child { border-bottom: 0; }
        .admin-row:hover { background: #FBFAF8; }

        .admin-row-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-row-title {
          font-weight: 800;
          font-size: .98rem;
          color: #12203A;
        }

        .admin-row-sub {
          font-size: .82rem;
          font-weight: 600;
          color: #8A8272;
        }

        .admin-chip {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          background: #FEF6E7;
          color: #B06A12;
          width: fit-content;
        }

        .admin-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .admin-icon-btn {
          background: none;
          border: 0;
          cursor: pointer;
          color: #9A9386;
          width: 36px;
          height: 36px;
          padding: 0;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .admin-icon-btn:hover { color: #12203A; background: #F4F2ED; }
        .admin-icon-btn--danger:hover { color: #C4534E; background: #FDF2F0; }
        .admin-icon-btn--ok:hover { color: #2F7D55; background: #EDF7F1; }
        .admin-icon-btn:disabled { opacity: .35; cursor: not-allowed; }

        .admin-empty {
          text-align: center;
          padding: 40px 16px;
          color: #8A8272;
          background: #fff;
          border: 1px dashed #EDE9E3;
          border-radius: 24px;
        }
      `}</style>

      <div className="admin-hero">
        <div className="page-badge"><span />הרשאות מנהל</div>
        <h1 className="admin-title">ניהול מערכת</h1>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={"admin-tab" + (activeTab === t.id ? " admin-tab--active" : "")}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.collection && counts[t.id] != null && (
              <span className="admin-tab-count"> {counts[t.id]}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "campus" && (
        <section className="admin-section">
          <div className="admin-card"><AddCampus /></div>
          <div className="admin-list-wrap"><CampusList /></div>
        </section>
      )}
      {activeTab === "hall" && (
        <section className="admin-section">
          <div className="admin-card"><AddHall /></div>
          <div className="admin-list-wrap"><HallList /></div>
        </section>
      )}
      {activeTab === "user" && (
        <section className="admin-section">
          <div className="admin-card"><AddUser /></div>
          <div className="admin-list-wrap"><UserList /></div>
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
