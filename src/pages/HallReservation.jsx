import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import JewishCalendar from "../components/Calendar"; // לוח חדש
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

  // שימוש ב-toLocaleDateString("sv-SE") לכל התאריכים כדי למנוע בעיות timezone
  const formatDate = (date) => date.toLocaleDateString("sv-SE");

  useEffect(() => {
    const fetchReservations = async () => {
      if (!hallId || !selectedDate) return;

      const formattedDate = formatDate(selectedDate);

      const q = query(
        collection(db, "reservations"),
        where("hallId", "==", hallId),
        where("date", "==", formattedDate)
      );
      const snapshot = await getDocs(q);
      const reservations = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          startTime: data.startTime,
          endTime: data.endTime,
          description: data.description,
        };
      });

      setReservationsByDate((prev) => ({
        ...prev,
        [formattedDate]: reservations,
      }));
    };
    fetchReservations();
  }, [hallId, selectedDate]);

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setShowModal(true);

    const formattedDate = formatDate(date);

    // שריונים
    const reservationsQuery = query(
      collection(db, "reservations"),
      where("hallId", "==", hallId),
      where("date", "==", formattedDate)
    );
    const reservationsSnapshot = await getDocs(reservationsQuery);
    const reservations = reservationsSnapshot.docs.map((d) => {
      const data = d.data();
      return {
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description,
      };
    });
    setReservationsByDate((prev) => ({
      ...prev,
      [formattedDate]: reservations,
    }));

    // אירועים/הערות
    const notesQuery = query(
      collection(db, "comments"),
      where("noteType", "==", "/commentType/event"),
      where("date", "==", formattedDate)
    );
    const notesSnapshot = await getDocs(notesQuery);
    const notes = notesSnapshot.docs.map((d) => ({
      noteText: d.data().noteText || "",
    }));
    setNotesByDate((prev) => ({ ...prev, [formattedDate]: notes }));
  };

  const formattedDate = selectedDate ? formatDate(selectedDate) : null;

  const handleReserve = () => setShowReserveModal(true);

  const confirmReservation = async () => {
    if (!startTime || !endTime) return alert("נא לבחור שעת התחלה וסיום");

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) return alert("שעת הסיום חייבת להיות אחרי שעת ההתחלה");

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

    setDescription("");
    setShowReserveModal(false);
    setStartTime("");
    setEndTime("");
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
      const formatted = formatDate(current);
      reservations.push({ date: formatted, startTime, endTime, description });
      current.setDate(current.getDate() + 7);
    }

    for (const r of reservations) {
      await saveReservationToFirestore({
        ...r,
        description: r.description || "אין",
      });
    }

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
      )} החודש:\n` +
        reservations
          .map(
            (r) => `${r.date} (${r.startTime}–${r.endTime}) - ${r.description}`
          )
          .join("\n")
    );

    setShowReserveModal(false);
    setStartTime("");
    setEndTime("");
    setDescription("");
  };

  const saveReservationToFirestore = async (reservation) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) return alert("אין משתמש מחובר, לא ניתן לשמור שריון.");

      const hallRef = doc(db, "halls", hallId);
      await addDoc(collection(db, "reservations"), {
        ...reservation,
        hall: hallRef,
        hallId,
        createdBy: `/users/${currentUser?.email || "unknown"}`,
      });

      // עדכון מיידי ליום הנוכחי
      setReservationsByDate((prev) => {
        const updated = { ...prev };
        const arr = updated[reservation.date] || [];
        updated[reservation.date] = [
          ...arr,
          {
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            description: reservation.description,
          },
        ];
        return updated;
      });
    } catch (e) {
      console.error("שגיאה בשמירת השריון:", e);
    }
  };

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    if (!hallId) console.warn("לא נבחר אולם.");
  }, [hallId]);

  return (
    <div className="stack" style={{ gap: "1rem" }}>
      <h1 className="page-title">הזמנת אולם: {hallName}</h1>

      <JewishCalendar date={selectedDate} setDate={handleDateClick} />

      {/* מודאל פרטי היום הנבחר + כפתור לשריון מתוך המודאל */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>פרטים לתאריך: {formattedDate}</h3>
            {isLoading ? (
              <p className="loading">טוען נתונים...</p>
            ) : (
              <>
                <h4>שריונים:</h4>
                {reservationsByDate[formattedDate]?.length ? (
                  <ul>
                    {reservationsByDate[formattedDate].map((ev, i) => (
                      <li key={i}>
                        {ev.startTime}–{ev.endTime}: {ev.description}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>אין שריונים ביום זה.</p>
                )}

                <h4>אירועים:</h4>
                {notesByDate[formattedDate]?.length ? (
                  <ul>
                    {notesByDate[formattedDate].map((n, i) => (
                      <li key={i}>{n.noteText}</li>
                    ))}
                  </ul>
                ) : (
                  <p>אין אירועים ביום זה.</p>
                )}

                <div className="row" style={{ marginTop: 12 }}>
                  <button
                    className="btn btn--accent"
                    onClick={() => {
                      setShowModal(false);
                      setShowReserveModal(true);
                    }}
                  >
                    לשריון תאריך זה
                  </button>
                  <button className="btn btn--ghost" onClick={closeModal}>
                    סגור
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* כפתור צף */}

      {/* מודאל השריון עצמו */}
      {showReserveModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowReserveModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>שריון לתאריך: {formattedDate}</h3>

            <div
              className="form-grid form-grid--3"
              style={{ marginTop: ".5rem" }}
            >
              <div>
                <label>שעת התחלה</label>
                <select
                  className="select-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  <option value="">בחר</option>
                  {[
                    "08:00",
                    "09:00",
                    "10:00",
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>שעת סיום</label>
                <select
                  className="select-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  <option value="">בחר</option>
                  {[
                    "09:00",
                    "10:00",
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label>תיאור</label>
                <textarea
                  className="textarea-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="הכנס תיאור לשריון"
                />
              </div>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn--accent" onClick={confirmReservation}>
                אישור שריון
              </button>
              <button className="btn" onClick={reserveFullMonth}>
                שריין עד סוף החודש
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setShowReserveModal(false)}
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* סגנון לכפתור הצף */}
      <style>{`
        .fab-reserve {
          position: fixed; right: 18px; bottom: 18px; z-index: 1001;
        }
      `}</style>
    </div>
  );
};

export default HallReservation;
