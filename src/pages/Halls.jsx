import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';

const Halls = () => {
  const [halls, setHalls] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'halls'));
        const hallList = querySnapshot.docs.map(doc => ({
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

  const goToReservation = (hallId) => {
    navigate('/hallReservation', { state: { hallId } });
  };

  return (
    <>
      <div className="hall-page">
        <h1 className="hall-title">בחר אולם</h1>
        <div className="hall-buttons">
          {halls.map(hall => (
            <button
              key={hall.id}
              onClick={() => goToReservation(hall.id)}
              className="hall-button"
            >
              {hall.name}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .hall-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 5rem;
        }

        .hall-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }

        .hall-buttons {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .hall-button {
          width: 100%;
          max-width: 16rem;
          height: 8rem;
          margin: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
          border-radius: 0.5rem;
          background-color: #2563eb; /* כחול */
          color: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: background-color 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .hall-button:hover {
          background-color: #1d4ed8;
        }

        @media (max-width: 768px) {
          .hall-button {
            width: 90%;
          }
        }
      `}</style>
    </>
  );
};

export default Halls;
