import React, { useEffect, useState } from "react";
import HomeButton from "../components/HomeButton";
import logo from "../assets/logo.webp";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setIsAdmin(false);
        return;
      }
      try {
        // בודק את מסמך המשתמש לפי אימייל; מצפה לשדה role: "admin"
        const snap = await getDoc(doc(db, "users", u.email));
        setIsAdmin(snap.exists() && snap.data()?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="home-page">
      <style>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f7fafd, #e6f3fa);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2em;
        }
        .logo {
          max-width: 140px;
          margin-bottom: 1em;
        }
        .home-title {
          font-size: 1.8em;
          color: #6ec8f1;
          margin-bottom: 1.2em;
          font-weight: bold;
        }
        .buttons-container {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      `}</style>

      <img src={logo} alt="Logo" className="logo" />
      <h1 className="home-title">home page</h1>

      <div className="buttons-container">
        <HomeButton text="add comment" to="/addComment" />
        <HomeButton text="halls" to="/halls" />
        <HomeButton text="fileSystem" to="/fileSystem" />
        <HomeButton text="SearchPage" to="/searchPage" />
        {isAdmin && <HomeButton text="עריכה" to="/admin" />}
      </div>
    </div>
  );
};

export default Home;
