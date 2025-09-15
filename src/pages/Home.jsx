// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import HomeButton from "../components/HomeButton";
// אם תרצי להחזיר לוגו, בטלי את ההערה והוסיפי <img .../> למטה
// import logo from "../assets/logo.webp";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

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

  return (
    <main className="home-page">
      <style>{`
        /* עוטף הדף – שקוף, התוכן מתחיל למעלה */
        .home-page{
          min-height: 100svh;
          background: transparent !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;   /* ↑↑ זה מעלה את התוכן למעלה */
          padding-block-start: clamp(24px, 4vw, 48px); /* יותר ריווח עליון */
          padding-block-end: clamp(20px, 3vw, 36px);
          padding-inline: clamp(12px, 3vw, 32px);
        }

        .home-inner{
          background: transparent !important;
          box-shadow: none !important;
          border: 0 !important;
          width: min(100%, 1100px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .home-logo{
          max-width: 140px;
          height: auto;
          display: block;
        }

        .home-title{
          margin: 0;
          font-size: clamp(1.4rem, 3.2vw, 2rem);
          color: #6ec8f1;
          font-weight: 800;
          letter-spacing: .4px;
        }

        .buttons-container{
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: .6rem;
          margin-top: .4rem;
        }
          .buttons-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 בעמודה */
  gap: 1rem; /* ריווח בין הכפתורים */
  width: 100%;
  max-width: 800px;
  margin-top: 1.2rem;
}

.buttons-container a {
  text-decoration: none;
}

.buttons-container button {
  background: linear-gradient(135deg, #4fc3f7, #0288d1); /* מעבר צבע */
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  width: 100%; /* יתפסו את הרוחב של התא */
  text-align: center;
}

.buttons-container button:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 8px 14px rgba(0,0,0,0.2);
  background: linear-gradient(135deg, #29b6f6, #0277bd);
}
  .home-title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem); /* יותר גדול */
  color: #0288d1; /* כחול חזק יותר */
  font-weight: 900; /* מודגש מאוד */
  letter-spacing: 1px;
  text-shadow: 0 3px 6px rgba(0,0,0,0.25); /* צל עדין */
  text-align: center;
  margin-bottom: 1.5rem;
}


      `}</style>

      <div className="home-inner">
        {/* אם תרצי לוגו כאן:
        <img src={logo} alt="Logo" className="home-logo" />
        */}

        <h1 className="home-title">דף הבית</h1>

        <div className="buttons-container">
          <HomeButton text="הוספת הערה" to="/addComment" />
          <HomeButton text="אולמות" to="/halls" />
          <HomeButton text="מערכת קבצים" to="/fileSystem" />
          <HomeButton text="חיפוש" to="/searchPage" />
          <HomeButton text="פרופיל" to="/profile" />
          {isAdmin && <HomeButton text="עריכה" to="/admin" />}
        </div>
      </div>
    </main>
  );
};

export default Home;
