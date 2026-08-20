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
import AppNotice from "../components/AppNotice";

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
  const [markedDates, setMarkedDates] = useState(() => new Set());
  const [notice, setNotice] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // שימוש ב-toLocaleDateString("sv-SE") לכל התאריכים כדי למנוע בעיות timezone
  const formatDate = (date) => date.toLocaleDateString("sv-SE");

  useEffect(() => {
    if (!hallId) return;
    (async () => {
      try {
        const q = query(collection(db, "reservations"), where("hallId", "==", hallId));
        const snapshot = await getDocs(q);
        setMarkedDates(new Set(snapshot.docs.map((d) => d.data().date).filter(Boolean)));
      } catch (e) {
        setMarkedDates(new Set());
      }
    })();
  }, [hallId]);

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

  /**
   * שומר שריון לאולם בתאריך הנבחר, אחרי בדיקת שעות תקינות.
   */
  const confirmReservation = async () => {
    const next = {
      startTime: startTime ? "" : "נא לבחור שעת התחלה",
      endTime: endTime ? "" : "נא לבחור שעת סיום",
    };
    setFormErrors(next);
    if (next.startTime || next.endTime) return;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) return setNotice({ title: "שעות לא תקינות", message: "שעת הסיום חייבת להיות אחרי שעת ההתחלה" });

    const reservation = {
      date: formattedDate,
      startTime,
      endTime,
      description: description || "אין",
    };
    const saved = await saveReservationToFirestore(reservation);
    if (!saved) return;

    setNotice({
      title: "האולם שוריין",
      message: `האולם "${hallName}" שוריין בתאריך ${formattedDate} משעה ${startTime} עד ${endTime}\nתיאור: ${reservation.description}`,
    });

    setDescription("");
    setShowReserveModal(false);
    setStartTime("");
    setEndTime("");
  };

  const reserveFullMonth = async () => {
    if (!selectedDate || !startTime || !endTime || !description) {
      setNotice({ title: "חסר פרט", message: "נא למלא את כל השדות (תאריך, שעות ותיאור)" });
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

    setNotice({
      title: "האולם שוריין",
      message:
        `האולם "${hallName}" שוריין בכל ימי ה-${selectedDate.toLocaleDateString(
          "he-IL",
          { weekday: "long" }
        )} החודש:\n` +
        reservations
          .map(
            (r) => `${r.date} (${r.startTime}–${r.endTime}) - ${r.description}`
          )
          .join("\n"),
    });

    setShowReserveModal(false);
    setStartTime("");
    setEndTime("");
    setDescription("");
  };

  const saveReservationToFirestore = async (reservation) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        setNotice({ title: "לא מחובר", message: "אין משתמש מחובר, לא ניתן לשמור שריון." });
        return false;
      }

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
      if (reservation.date) {
        setMarkedDates((prev) => {
          const next = new Set(prev);
          next.add(reservation.date);
          return next;
        });
      }
      return true;
    } catch (e) {
      console.error("שגיאה בשמירת השריון:", e);
      return false;
    }
  };

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    if (!hallId) console.warn("לא נבחר אולם.");
  }, [hallId]);

  return (
    <div className="reserve-page">
      <style>{`
        .reserve-page {
          width: 100%;
          max-width: 940px;
          margin: 0 auto;
        }
        .reserve-hero { padding-bottom: 16px; }
        .reserve-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 600;
          font-size: 11.5px;
          color: #8A8272;
          margin-bottom: 10px;
        }
        .reserve-badge span { width: 6px; height: 6px; border-radius: 999px; background: #35B6E8; }
        .reserve-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .reserve-actions .btn {
          flex: 1;
          min-width: 100px;
        }
        @media (min-width: 480px) {
          .reserve-actions .btn { flex: 0 1 auto; }
        }
        .reserve-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .reserve-list li {
          background: #F7FBFD;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 10px 12px;
          text-align: right;
        }
      `}</style>

      <div className="reserve-hero">
        <div className="reserve-badge"><span />הזמנת אולם</div>
        <h1 className="page-title">{hallName || "הזמנת אולם"}</h1>
      </div>

      <JewishCalendar
        date={selectedDate}
        setDate={handleDateClick}
        markedDates={markedDates}
        markLabel="יש הזמנות"
      />

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
                  <ul className="reserve-list">
                    {reservationsByDate[formattedDate].map((ev, i) => (
                      <li key={i}>
                        <strong>{ev.startTime}–{ev.endTime}</strong>
                        {ev.description ? ` · ${ev.description}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>אין שריונים ביום זה.</p>
                )}

                <h4>אירועים:</h4>
                {notesByDate[formattedDate]?.length ? (
                  <ul className="reserve-list">
                    {notesByDate[formattedDate].map((n, i) => (
                      <li key={i}>{n.noteText}</li>
                    ))}
                  </ul>
                ) : (
                  <p>אין אירועים ביום זה.</p>
                )}

                <div className="reserve-actions">
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
                  className={"select-input" + (formErrors.startTime ? " is-invalid" : "")}
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setFormErrors((p) => ({ ...p, startTime: "" })); }}
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
                <div className="field-hint">שעת תחילת השימוש באולם</div>
                {formErrors.startTime ? <div className="field-error">{formErrors.startTime}</div> : null}
              </div>

              <div>
                <label>שעת סיום</label>
                <select
                  className={"select-input" + (formErrors.endTime ? " is-invalid" : "")}
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setFormErrors((p) => ({ ...p, endTime: "" })); }}
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
                <div className="field-hint">חייבת להיות אחרי שעת ההתחלה</div>
                {formErrors.endTime ? <div className="field-error">{formErrors.endTime}</div> : null}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label>תיאור</label>
                <textarea
                  className="textarea-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="לדוגמה: ישיבת צוות, חוג, אירוע"
                />
                <div className="field-hint">לא חובה בשריון חד-פעמי. חובה בשריון עד סוף החודש.</div>
              </div>
            </div>

            <div className="reserve-actions">
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

      {notice && (
        <AppNotice
          title={notice.title}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      )}
    </div>
  );
};

export default HallReservation;
