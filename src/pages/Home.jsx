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
          <HomeButton text="חיפוס" to="/searchPage" />
          <HomeButton text="פרופיל" to="/profile" />
          {isAdmin && <HomeButton text="עריכה" to="/admin" />}
        </div>
      </div>
    </main>
  );
};

export default Home;
