import React, { useState } from "react";
import Calendar from "../components/Calendar";

const HallReservation = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const mockEvents = {
    "2025-05-13": ["פגישה עם מנהל", "בדיקת אולם א'"],
    "2025-05-15": ["אירוע בוקר", "חזרה טכנית"],
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
  };

  // שימוש בזמן מקומי כדי להימנע מהזזה ליום הקודם
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("sv-SE") // פורמט YYYY-MM-DD עם זמן מקומי
    : null;

  return (
    <div className="hall-reservation-page">
      <h1 className="page-title">הזמנת אולם</h1>
      <p className="page-description">בחר תאריך ביומן להזמנה:</p>
      <Calendar onChange={handleDateClick} value={selectedDate} />

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">פרטים לתאריך: {formattedDate}</h2>
            {mockEvents[formattedDate] ? (
              <ul>
                {mockEvents[formattedDate].map((event, index) => (
                  <li key={index}>{event}</li>
                ))}
              </ul>
            ) : (
              <p>אין אירועים ביום זה.</p>
            )}
            <button className="close-button" onClick={closeModal}>סגור</button>
          </div>
        </div>
      )}

      <style>{`
        .hall-reservation-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f9f9f9;
          border-radius: 1rem;
          font-family: Arial, sans-serif;
        }

        .page-title {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-align: center;
        }

        .page-description {
          font-size: 1.125rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .close-button {
          margin-top: 1rem;
          background-color: #007BFF;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        .close-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default HallReservation;
