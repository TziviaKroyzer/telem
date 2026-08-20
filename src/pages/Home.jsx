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
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { HDate } from "@hebcal/core";

const cards = [
  {
    text: "הוספת הערה",
    sub: "שליחת הערות ובקשות ליומן",
    to: "/addComment",
    icon: MessageSquarePlus,
    color: "#E8467C",
  },
  {
    text: "אולמות",
    sub: "ניהול והזמנת אולמות",
    to: "/halls",
    icon: Building2,
    color: "#35B6E8",
  },
  {
    text: "מערכת קבצים",
    sub: "גישה למסמכים וקבצים",
    to: "/fileSystem",
    icon: FolderOpen,
    color: "#F5B93B",
  },
  {
    text: "חיפוש",
    sub: "חיפוש מידע",
    to: "/searchPage",
    icon: Search,
    color: "#F0862A",
  },
  {
    text: "פרופיל",
    sub: "משימות אישיות",
    to: "/profile",
    icon: UserCircle,
    color: "#7C5CD6",
  },
  {
    text: "ניהול מערכת",
    sub: "קמפוסים, אולמות, משתמשים",
    to: "/admin",
    icon: Settings,
    color: "#35B6E8",
    adminOnly: true,
    dark: true,
  },
];

function greetingWord() {
  const h = new Date().getHours();
  if (h < 5) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
}

function hebrewDateBadge() {
  try {
    return new HDate(new Date()).renderGematriya();
  } catch {
    return new Date().toLocaleDateString("he-IL", { day: "numeric", month: "long" });
  }
}

function pendingNotesText(n) {
  if (n === 0) return "אין הערות ממתינות";
  if (n === 1) return "הערה אחת ממתינה לך";
  return `${n} הערות ממתינות לך`;
}

const HomeCard = ({ text, sub, to, icon: Icon, color, dark }) => {
  const navigate = useNavigate();
  return (
    <button
      className={`home-card${dark ? " home-card--dark" : ""}`}
      style={{ "--card-color": color }}
      onClick={() => navigate(to)}
    >
      <span className="home-card-bar" />
      <span className="home-card-body">
        <span className="home-card-icon">
          <Icon size={24} strokeWidth={2} />
        </span>
        <span className="home-card-text">
          <span className="home-card-title">{text}</span>
          <span className="home-card-sub">{sub}</span>
        </span>
      </span>
    </button>
  );
};

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [pendingNotes, setPendingNotes] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setIsAdmin(false);
        setFirstName("");
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.email));
        const data = snap.exists() ? snap.data() : null;
        setIsAdmin(data?.role === "admin");
        setFirstName(data?.firstName || "");
      } catch {
        setIsAdmin(false);
        setFirstName("");
      }

      try {
        const notesSnap = await getDocs(
          query(
            collection(db, "comments"),
            where("user", "==", u.email),
            where("done", "==", false)
          )
        );
        setPendingNotes(notesSnap.size);
      } catch {
        setPendingNotes(0);
      }
    });
    return () => unsub();
  }, []);

  const visible = cards.filter((c) => !c.adminOnly || isAdmin);

  return (
    <main className="home-page">
      <style>{`
        .home-page {
          width: 100%;
          max-width: none;
          margin: 0;
          background: transparent;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          padding: 8px 0 32px;
        }

        .home-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          flex-wrap: wrap;
          padding-bottom: 22px;
        }

        .home-hero-copy {
          max-width: 480px;
        }

        .home-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 600;
          font-size: 11.5px;
          letter-spacing: .04em;
          color: #8A8272;
          margin-bottom: 14px;
        }

        .home-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #E8467C;
        }

        .home-hero h1 {
          margin: 0;
          font-family: "Heebo", var(--font-sans);
          font-weight: 900;
          font-size: clamp(1.9rem, 4.5vw, 2.9rem);
          line-height: 1.05;
          letter-spacing: -1px;
          color: #12203A;
        }

        .home-hero p {
          margin: 14px 0 0;
          font-size: clamp(.85rem, 2vw, 1rem);
          line-height: 1.55;
          color: #6C6659;
          max-width: 420px;
        }

        .home-hero-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .home-btn {
          border: none;
          cursor: pointer;
          border-radius: 999px;
          font-weight: 700;
          font-size: 13.5px;
          padding: 13px 22px;
          min-height: 46px;
          -webkit-tap-highlight-color: transparent;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }

        .home-btn--ghost {
          background: transparent;
          border: 1.5px solid #12203A;
          color: #12203A;
        }

        .home-btn--ghost:hover { background: rgba(18,32,58,.05); }

        .home-btn--solid {
          background: #12203A;
          color: #fff;
        }

        .home-btn--solid:hover {
          background: #1D3358;
          box-shadow: 0 8px 20px rgba(18,32,58,.25);
          transform: translateY(-1px);
        }

        .home-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(14px, 2vw, 22px);
        }

        @media (max-width: 900px) {
          .home-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 560px) {
          .home-grid { grid-template-columns: 1fr; }
        }

        .home-card {
          --card-color: #12203A;
          position: relative;
          background: #fff;
          border: 1px solid #EDE9E3;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: right;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
          min-height: 176px;
          transition: box-shadow .2s ease, transform .2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .home-card:hover {
          box-shadow: 0 14px 30px rgba(18,32,58,.1);
          transform: translateY(-2px);
        }

        .home-card--dark {
          background: #12203A;
        }

        .home-card-bar {
          height: 5px;
          background: var(--card-color);
        }

        .home-card-body {
          padding: 22px 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          flex: 1;
        }

        .home-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #F4F2ED;
          color: #12203A;
        }

        .home-card--dark .home-card-icon {
          background: #F4F2ED;
          color: #12203A;
        }

        .home-card-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: auto;
        }

        .home-card-title {
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -.3px;
          color: #12203A;
        }

        .home-card--dark .home-card-title { color: #fff; }

        .home-card-sub {
          font-size: 13px;
          line-height: 1.5;
          color: #6C6659;
        }

        .home-card--dark .home-card-sub { color: rgba(255,255,255,.6); }

        .home-logout {
          margin-top: 26px;
          background: none;
          border: 1.5px solid #EDE9E3;
          border-radius: 999px;
          color: #6C6659;
          font-size: .85rem;
          font-weight: 700;
          padding: .5rem 1.3rem;
          min-height: 38px;
          cursor: pointer;
          transition: border-color .15s, color .15s, background .15s;
          display: inline-flex;
        }

        .home-logout:hover {
          border-color: #E8467C;
          color: #E8467C;
          background: rgba(232,70,124,.06);
        }
      `}</style>

      <div className="home-hero">
        <div className="home-hero-copy">
          <div className="home-badge">
            <span className="home-badge-dot" />
            {hebrewDateBadge()}
          </div>
          <h1>
            {greetingWord()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p>
            {pendingNotesText(pendingNotes)}
          </p>
        </div>
        <div className="home-hero-actions">
          <button className="home-btn home-btn--solid" onClick={() => navigate("/addComment")}>
            הערה חדשה
          </button>
        </div>
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
