// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquarePlus,
  Building2,
  FolderOpen,
  Search,
  UserCircle,
  Settings,
} from "lucide-react";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const cards = [
  {
    text: "מערכת קבצים",
    sub: "גישה למסמכים וקבצים",
    to: "/fileSystem",
    icon: FolderOpen,
  },
  {
    text: "אולמות",
    sub: "ניהול והזמנת אולמות",
    to: "/halls",
    icon: Building2,
  },
  {
    text: "הוספת הערה",
    sub: "שליחת הערות ובקשות",
    to: "/addComment",
    icon: MessageSquarePlus,
  },
  {
    text: "עריכה",
    sub: "הגדרות וניהול מערכת",
    to: "/admin",
    icon: Settings,
    adminOnly: true,
  },
  {
    text: "פרופיל",
    sub: "מידע אישי והגדרות",
    to: "/profile",
    icon: UserCircle,
  },
  {
    text: "חיפוש",
    sub: "חיפוש מידע ומסמכים",
    to: "/searchPage",
    icon: Search,
  },
];

const HomeCard = ({ text, sub, to, icon: Icon }) => {
  const navigate = useNavigate();
  return (
    <button className="home-card" onClick={() => navigate(to)}>
      <span className="home-card-icon">
        <Icon size={22} strokeWidth={1.5} />
      </span>
      <span className="home-card-title">{text}</span>
      <span className="home-card-sub">{sub}</span>
    </button>
  );
};

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return setIsAdmin(false);
      try {
        const snap = await getDoc(doc(db, "users", u.email));
        setIsAdmin(snap.exists() && snap.data()?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  const visible = cards.filter((c) => !c.adminOnly || isAdmin);

  return (
    <main className="home-page">
      <style>{`
        .home-page {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: clamp(8px, 2vw, 20px) 16px 24px;
        }

        /* --- Welcome header --- */
        .home-welcome {
          text-align: center;
          margin-bottom: clamp(14px, 2.5vw, 28px);
        }

        .home-welcome h1 {
          font-size: clamp(1.4rem, 3.5vw, 2rem);
          font-weight: 800;
          color: #1a2b4a;
          margin: 0 0 5px;
          letter-spacing: 0.5px;
        }

        .home-welcome p {
          font-size: clamp(0.8rem, 2vw, 0.95rem);
          color: #6b7f9e;
          margin: 0 0 10px;
        }

        .home-divider {
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #6ec8f1, #0288d1);
          border-radius: 999px;
          margin: 0 auto;
        }

        /* --- Cards grid --- */
        .home-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(8px, 1.8vw, 16px);
          width: 100%;
          max-width: 680px;
        }

        @media (min-width: 600px) {
          .home-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* --- Individual card --- */
        .home-card {
          background: #ffffff;
          border: 1px solid #e4edf6;
          border-radius: 16px;
          box-shadow: 0 3px 12px rgba(2, 136, 209, 0.07);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: clamp(14px, 3vw, 24px) 12px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          width: 100%;
          text-align: center;
        }

        .home-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(2, 136, 209, 0.14);
        }

        .home-card:active {
          transform: translateY(-1px);
        }

        .home-card-icon {
          color: #0288d1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: #eaf6ff;
          border-radius: 11px;
        }

        .home-card-title {
          font-size: clamp(0.82rem, 2vw, 0.95rem);
          font-weight: 700;
          color: #1a2b4a;
          line-height: 1.2;
        }

        .home-card-sub {
          font-size: clamp(0.68rem, 1.6vw, 0.78rem);
          color: #7a92b0;
          line-height: 1.3;
        }

        .home-logout {
          margin-top: clamp(18px, 3vw, 28px);
          background: none;
          border: 1.5px solid #e0e4ec;
          border-radius: 8px;
          color: #637186;
          font-size: 0.88rem;
          font-weight: 600;
          padding: 0.45rem 1.4rem;
          min-height: 36px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }

        .home-logout:hover {
          border-color: #e76b6b;
          color: #e76b6b;
          background: rgba(231,107,107,0.06);
        }
      `}</style>

      <div className="home-welcome">
        <h1>ברוכים הבאים</h1>
        <p>למערכת הדף הבית של מתחם חלים</p>
        <div className="home-divider" />
      </div>

      <div className="home-grid">
        {visible.map((c) => (
          <HomeCard key={c.to} {...c} />
        ))}
      </div>

      <button className="home-logout" onClick={() => signOut(auth)}>
        התנתק
      </button>
    </main>
  );
};

export default Home;
