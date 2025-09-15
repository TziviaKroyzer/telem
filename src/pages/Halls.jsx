// src/pages/Halls.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; // ← שימי לב למסלול


const Halls = () => {
  const [halls, setHalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const qs = await getDocs(collection(db, "halls"));
        const list = qs.docs.map(d => ({ id: d.id, ...d.data() }));
        setHalls(list);
      } catch (e) {
        console.error("שגיאה בשליפת האולמות:", e);
      }
    })();
  }, []);

  const goToReservation = (hallId, hallName) =>
    navigate("/hallReservation", { state: { hallId, hallName } });

  return (
    <div className="stack center" style={{ gap: "1rem", minHeight: "60vh" }}>
      <h1>בחר אולם</h1>
      <div className="row center" style={{ gap: "12px", flexWrap: "wrap" }}>
        {halls.map((hall) => (
          <button
            key={hall.id}
            onClick={() => goToReservation(hall.id, hall.name)}
            className="btn btn--pill"
          >
            {hall.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Halls;
