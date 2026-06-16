// src/pages/Halls.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { Building2 } from "lucide-react";

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const qs = await getDocs(collection(db, "halls"));
        const list = qs.docs.map((d) => ({ id: d.id, ...d.data() }));
        setHalls(list);
      } catch (e) {
        console.error("שגיאה בשליפת האולמות:", e);
      }
    })();
  }, []);

  const goToReservation = (hallId, hallName) =>
    navigate("/hallReservation", { state: { hallId, hallName } });

  return (
    <main className="halls-page">
      <style>{`
        .halls-page {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: clamp(8px, 2vw, 20px) 16px 24px;
        }

        .halls-welcome {
          text-align: center;
          margin-bottom: clamp(14px, 2.5vw, 28px);
        }

        .halls-welcome h1 {
          font-size: clamp(1.4rem, 3.5vw, 2rem);
          font-weight: 800;
          color: #1a2b4a;
          margin: 0 0 5px;
        }

        .halls-divider {
          width: 40px;
          height: 3px;
          background: linear-gradient(90deg, #6ec8f1, #0288d1);
          border-radius: 999px;
          margin: 0 auto;
        }

        .halls-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(8px, 1.8vw, 16px);
          width: 100%;
          max-width: 680px;
        }

        @media (min-width: 520px) {
          .halls-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .hall-card {
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

        .hall-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(2, 136, 209, 0.14);
        }

        .hall-card:active {
          transform: translateY(-1px);
        }

        .hall-card-icon {
          color: #0288d1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: #eaf6ff;
          border-radius: 11px;
        }

        .hall-card-title {
          font-size: clamp(0.82rem, 2vw, 0.95rem);
          font-weight: 700;
          color: #1a2b4a;
          line-height: 1.2;
        }
      `}</style>

      <div className="halls-welcome">
        <h1>בחר אולם</h1>
        <div className="halls-divider" />
      </div>

      <div className="halls-grid">
        {halls.map((hall) => (
          <button
            key={hall.id}
            className="hall-card"
            onClick={() => goToReservation(hall.id, hall.name)}
          >
            <span className="hall-card-icon">
              <Building2 size={22} strokeWidth={1.5} />
            </span>
            <span className="hall-card-title">{hall.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
};

export default Halls;
