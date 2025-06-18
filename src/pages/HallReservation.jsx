import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Calendar from "../components/Calendar";

import {
  doc,
  query,
  where,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

import { getAuth } from "firebase/auth";

const HallReservation = () => {
  const location = useLocation();
  const hallId = location.state?.hallId;
  const hallName = location.state?.hallName;

  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [showReserveModal, setShowReserveModal] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [reservationsByDate, setReservationsByDate] = useState({});

  const [notesByDate, setNotesByDate] = useState({});

  useEffect(() => {
    const fetchReservations = async () => {
      if (!hallId || !selectedDate) return;

      const formattedDate = selectedDate.toLocaleDateString("sv-SE");

      const q = query(
        collection(db, "reservations"),
        where("hallId", "==", hallId),
        where("date", "==", formattedDate)
      );

      const snapshot = await getDocs(q);

      const reservations = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reservations.push({
          startTime: data.startTime,
          endTime: data.endTime,
          description: data.description,
        });
      });

      setReservationsByDate((prev) => {
        const updated = { ...prev };

        reservations.forEach(({ date, startTime, endTime, description }) => {
          if (!updated[date]) {
            updated[date] = [{ startTime, endTime, description }];
          } else {
            // בדיקה אם אותו שריון כבר קיים – אם לא, נוסיף אותו
            const exists = updated[date].some(
              (r) =>
                r.startTime === startTime &&
                r.endTime === endTime &&
                r.description === description
            );
            if (!exists) {
              updated[date].push({ startTime, endTime, description });
            }
          }
        });

        return updated;
      });
    };

    fetchReservations();
  }, [hallId, selectedDate]);
  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setShowModal(true);

    const formattedDate = date.toLocaleDateString("sv-SE");

    // שריונים
    const reservationsQuery = query(
      collection(db, "reservations"),
      where("hallId", "==", hallId),
      where("date", "==", formattedDate)
    );
    const reservationsSnapshot = await getDocs(reservationsQuery);
    const reservations = [];
    reservationsSnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description,
      });
    });
    setReservationsByDate((prev) => ({
      ...prev,
      [formattedDate]: reservations,
    }));

    // הערות / אירועים
    const notesQuery = query(
      collection(db, "comments"), // או collection(db, "events")
      where("noteType", "==", "/commentType/event"),
      where("date", "==", formattedDate)
    );
    const notesSnapshot = await getDocs(notesQuery);
    const notes = [];
    notesSnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        noteText: data.noteText || "",
      });
    });

    setNotesByDate((prev) => ({
      ...prev,
      [formattedDate]: notes,
    }));
  };

  const reserveFullMonth = async () => {
    if (!selectedDate || !startTime || !endTime || !description) {
      alert("נא למלא את כל השדות (תאריך, שעות ותיאור)");
      return;
    }

    const reservations = [];
    const currentDate = new Date(selectedDate);
    const currentMonth = currentDate.getMonth();
    let current = new Date(currentDate);

    while (current.getMonth() === currentMonth) {
      const formatted = current.toLocaleDateString("sv-SE");
      reservations.push({
        date: formatted,
        startTime,
        endTime,
        description,
      });
      current.setDate(current.getDate() + 7);
    }

    // שמירה ל-Firebase
    for (const reservation of reservations) {
      await saveReservationToFirestore({
        ...reservation,
        description: reservation.description || "אין",
      });
    }

    // עדכון מיידי של ה-state כדי שהשריונים יופיעו בלוח
    setReservationsByDate((prev) => {
      const updated = { ...prev };
      for (const { date, startTime, endTime, description } of reservations) {
        if (!updated[date]) updated[date] = [];
        updated[date].push({ startTime, endTime, description });
      }
      return updated;
    });

    alert(
      `האולם "${hallName}" שוריין בכל ימי ה-${selectedDate.toLocaleDateString(
        "he-IL",
        { weekday: "long" }
      )} הקרובים בחודש:\n` +
        reservations
          .map(
            (r) => `${r.date} (${r.startTime}–${r.endTime}) - ${r.description}`
          )
          .join("\n")
    );

    // איפוס
    setShowReserveModal(false);
    setStartTime("");
    setEndTime("");
    setDescription("");
  };

  const handleReserve = () => {
    setShowReserveModal(true);
  };

  const confirmReservation = async () => {
    if (!startTime || !endTime) {
      alert("נא לבחור שעת התחלה וסיום");
      return;
    }

    // בדיקה ששעת הסיום מאוחרת מהתחלה
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) {
      alert("שעת הסיום חייבת להיות אחרי שעת ההתחלה");
      return;
    }
    const reservation = {
      date: formattedDate,
      startTime,
      endTime,
      description: description || "אין",
    };

    await saveReservationToFirestore(reservation);

    alert(
      `האולם "${hallName}" שוריין בתאריך ${formattedDate} משעה ${startTime} עד ${endTime}\nתיאור: ${reservation.description}`
    );

    // איפוס
    setDescription("");
    setShowReserveModal(false);
    setStartTime("");
    setEndTime("");
  };

  const saveReservationToFirestore = async (reservation) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("אין משתמש מחובר, לא ניתן לשמור שריון.");
        return;
      }

      const hallRef = doc(db, "halls", hallId);
      await addDoc(collection(db, "reservations"), {
        ...reservation,
        hall: hallRef,
        hallId: hallId,
        createdBy: `/users/${currentUser?.email || "unknown"}`,
        // timestamp: new Date(),
      });

      console.log("שריון נשמר בהצלחה עם משתמש:", currentUser.uid);
    } catch (error) {
      console.error("שגיאה בשמירת השריון:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
  };

  useEffect(() => {
    if (!hallId) {
      console.warn("לא נבחר אולם.");
    } else {
      console.log("הגעת מתוך אולם עם מזהה:", hallId);

      // כאן אפשר לטעון את המידע של האולם מה-DB לפי hallId אם צריך
    }
  }, [hallId]);

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("sv-SE")
    : null;

  return (
    <div className="hall-reservation-page">
      <h1 className="page-title">הזמנת אולם: {hallName}</h1>

      <Calendar onChange={handleDateClick} value={selectedDate} />
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">פרטים לתאריך: {formattedDate}</h2>
            {isLoading ? (
              <p className="loading">טוען נתונים...</p>
            ) : (
              <>
                <h3>שריונים:</h3>
                {reservationsByDate[formattedDate]?.length > 0 ? (
                  <ul>
                    {reservationsByDate[formattedDate].map((event, index) => (
                      <li key={index}>
                        {event.startTime}–{event.endTime}: {event.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>אין שריונים ביום זה.</p>
                )}

                <h3>אירועים:</h3>
                {notesByDate[formattedDate]?.length > 0 ? (
                  <ul>
                    {notesByDate[formattedDate].map((note, index) => (
                      <li key={index}>{note.noteText}</li>
                    ))}
                  </ul>
                ) : (
                  <p>אין אירועים ביום זה.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {selectedDate && (
        <button className="reserve-button" onClick={handleReserve}>
          לשריון
        </button>
      )}
      {showReserveModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowReserveModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">שריון לתאריך: {formattedDate}</h2>

            <label>
              שעת התחלה:
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                <option value="">בחר</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
              </select>
            </label>

            <label>
              שעת סיום:
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              >
                <option value="">בחר</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
              </select>
            </label>

            <label>
              תיאור:
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="הכנס תיאור לשריון"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #ccc",
                  marginTop: "0.5rem",
                }}
              />
            </label>
            <button className="confirm-button" onClick={confirmReservation}>
              אישור שריון
            </button>
            <button className="reserve-month-button" onClick={reserveFullMonth}>
              שריין את החודש הקרוב
            </button>
            <button
              className="close-button"
              onClick={() => setShowReserveModal(false)}
            >
              סגור
            </button>
          </div>
        </div>
      )}
      <style>{`
        .reserve-button {
  margin-top: 1.5rem;
  background-color: #10b981; /* ירוק */
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 1.125rem;
  cursor: pointer;
}

.reserve-button:hover {
  background-color: #059669;
}

label {
  display: block;
  margin: 1rem 0;
  font-weight: bold;
}

select {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid #ccc;
  width: 100%;
}

.confirm-button {
  margin-top: 1rem;
  background-color: #2563eb; /* כחול */
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #1d4ed8;
}

input[type="text"] {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid #ccc;
  width: 100%;
}

.reserve-month-button {
  margin-top: 1rem;
  background-color: #f59e0b; /* כתום */
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
}

.reserve-month-button:hover {
  background-color:rgb(59, 217, 6);
}

.loading {
  text-align: center;
  font-size: 1.1rem;
  color: #555;
  animation: blink 1.2s infinite;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

        `}</style>
    </div>
  );
};

export default HallReservation;
