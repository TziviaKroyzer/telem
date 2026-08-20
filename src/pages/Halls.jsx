// src/pages/Halls.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { Building2 } from "lucide-react";

const CARD_COLORS = ["#35B6E8", "#F5B93B", "#7C5CD6", "#E8467C", "#F0862A"];

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const [campusMap, setCampusMap] = useState({});
  const [reservationsByHall, setReservationsByHall] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [hallsSnap, campusSnap] = await Promise.all([
          getDocs(collection(db, "halls")),
          getDocs(collection(db, "campuses")),
        ]);
        setHalls(hallsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const cMap = {};
        campusSnap.docs.forEach((d) => {
          cMap[`/campuses/${d.id}`] = d.data().name || d.id;
        });
        setCampusMap(cMap);
      } catch (e) {
        console.error("שגיאה בשליפת האולמות:", e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const todayStr = new Date().toLocaleDateString("sv-SE");
        const snap = await getDocs(
          query(collection(db, "reservations"), where("date", "==", todayStr))
        );
        const byHall = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (!byHall[data.hallId]) byHall[data.hallId] = [];
          byHall[data.hallId].push(data);
        });
        setReservationsByHall(byHall);
      } catch (e) {
        setReservationsByHall({});
      }
    })();
  }, []);

  const goToReservation = (hallId, hallName) =>
    navigate("/hallReservation", { state: { hallId, hallName } });

  return (
    <main className="halls-page">
      <style>{`
        .halls-page {
          width: 100%;
          margin: 0 auto;
        }

        .halls-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          padding-bottom: 22px;
        }

        .halls-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 600;
          font-size: 11.5px;
          color: #8A8272;
          margin-bottom: 12px;
        }

        .halls-badge span { width: 6px; height: 6px; border-radius: 999px; background: #35B6E8; }

        .halls-title {
          margin: 0;
          font-family: "Heebo", var(--font-sans);
          font-weight: 900;
          font-size: clamp(1.8rem, 4.5vw, 2.5rem);
          letter-spacing: -.8px;
          color: #12203A;
        }

        .halls-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
          width: 100%;
        }

        @media (max-width: 640px) {
          .halls-grid { grid-template-columns: 1fr; }
        }

        .hall-card {
          --card-color: #35B6E8;
          background: var(--bg-card);
          border: 1px solid var(--line);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          text-align: right;
          cursor: pointer;
          padding: 0;
          min-height: 280px;
          font-family: inherit;
          transition: box-shadow .2s ease, transform .2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .hall-card:hover {
          box-shadow: 0 16px 34px rgba(18,32,58,.12);
          transform: translateY(-2px);
        }

        .hall-card-bar { height: 7px; background: var(--card-color); }

        .hall-card-body {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          flex: 1;
        }

        .hall-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }

        .hall-card-name { font-weight: 900; font-size: clamp(1.45rem, 3vw, 1.85rem); letter-spacing: -.5px; color: #12203A; display: block; }
        .hall-card-sub { font-size: 14px; color: #8A8272; margin-top: 6px; display: block; }

        .hall-card-status {
          flex: none;
          font-weight: 700;
          font-size: 12px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #F4F2ED;
          color: #8A8272;
        }

        .hall-card-status--busy { background: #E9F6FC; color: #1F6E96; }
        .hall-card-status--free { background: #EDF7F1; color: #2F7D55; }

        .hall-card-slots {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hall-card-slot {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #F7FBFD;
          border-inline-start: 4px solid var(--card-color);
          font-size: 14px;
        }

        .hall-card-slot-time { font-weight: 700; color: #12203A; flex: none; }
        .hall-card-slot-desc { color: #6C6659; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .hall-card-empty {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 0;
          font-size: 15px;
          color: #8A8272;
        }

        .hall-card-cta {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          border: 1.5px solid #12203A;
          border-radius: 999px;
          font-weight: 800;
          font-size: 15px;
          color: #12203A;
          transition: background .15s ease;
        }

        .hall-card:hover .hall-card-cta { background: rgba(18,32,58,.05); }

        .halls-empty { text-align: center; padding: 40px 0; color: #8A8272; font-size: .9rem; }
      `}</style>

      <div className="halls-hero">
        <div>
          <div className="halls-badge"><span />אולמות</div>
          <h1 className="halls-title">בחירת אולם</h1>
        </div>
      </div>

      <div className="halls-grid">
        {halls.map((hall, i) => {
          const color = CARD_COLORS[i % CARD_COLORS.length];
          const slots = reservationsByHall[hall.id] || [];
          return (
            <button
              key={hall.id}
              className="hall-card"
              style={{ "--card-color": color }}
              onClick={() => goToReservation(hall.id, hall.name)}
            >
              <span className="hall-card-bar" />
              <span className="hall-card-body">
                <span className="hall-card-top">
                  <span>
                    <span className="hall-card-name">{hall.name}</span>
                    <span className="hall-card-sub">
                      {campusMap[hall.campus] || ""}
                      {hall.address ? ` · ${hall.address}` : ""}
                    </span>
                  </span>
                  {slots.length > 0 ? (
                    <span className="hall-card-status hall-card-status--busy">{slots.length} הזמנות</span>
                  ) : (
                    <span className="hall-card-status hall-card-status--free">פנוי</span>
                  )}
                </span>

                {slots.length > 0 ? (
                  <span className="hall-card-slots">
                    {slots.slice(0, 2).map((s, idx) => (
                      <span className="hall-card-slot" key={idx}>
                        <span className="hall-card-slot-time">{s.startTime}</span>
                        <span className="hall-card-slot-desc">{s.description}</span>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="hall-card-empty">
                    <Building2 size={20} strokeWidth={2} />
                    אין הזמנות להיום
                  </span>
                )}

                <span className="hall-card-cta">הזמן שעה</span>
              </span>
            </button>
          );
        })}
      </div>

      {halls.length === 0 && <div className="halls-empty">אין אולמות להצגה</div>}
    </main>
  );
};

export default Halls;
