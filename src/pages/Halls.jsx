import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "halls"));
        const hallList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHalls(hallList);
      } catch (error) {
        console.error("שגיאה בשליפת האולמות:", error);
      }
    };

    fetchHalls();
  }, []);

  const goToReservation = (hallId, hallName) => {
    navigate("/hallReservation", { state: { hallId, hallName } });
  };

  return (
    
      <div className="hall-page">
        <h1 className="hall-title">בחר אולם</h1>
        <div className="hall-buttons">
          {halls.map((hall) => (
            <button
              key={hall.id}
              onClick={() => goToReservation(hall.id, hall.name)}
              className="hall-button"
            >
              {hall.name}
            </button>
          ))}
        </div>
      </div>

      
   
  );
};

export default Halls;
