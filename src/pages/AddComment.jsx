import React, { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import SelectInput from "../components/SelectInput";
import TextAreaInput from "../components/TextAreaInput";
import ConfirmationModal from "../components/ConfirmationModal";
import FileUploadInput from "../components/FileUploadInput";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { fieldError } from "../utils/validation";

const AddComment = () => {
  const [date, setDate] = useState(new Date());
  const [campus, setCampus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [noteType, setNoteType] = useState("");
  const [noteText, setNoteText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [commentType, setCommentType] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notifyUsers, setNotifyUsers] = useState([]);
  const [dayComments, setDayComments] = useState([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [loadingDayComments, setLoadingDayComments] = useState(false);
  const [markedDates, setMarkedDates] = useState(() => new Set());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const campusCollection = collection(db, "campuses");
        const snapshot = await getDocs(campusCollection);
        const campusList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCampusOptions(campusList);
      } catch (error) {
        console.error("שגיאה בשליפת הקמפוסים:", error);
      }
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    const fetchCommentTypes = async () => {
      try {
        const commentTypeCollection = collection(db, "commentType");
        const snapshot = await getDocs(commentTypeCollection);
        const typesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCommentType(typesList);
      } catch (error) {
        console.error("שגיאה בשליפת סוגי ההערות:", error);
      }
    };
    fetchCommentTypes();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().firstName || doc.data().email,
        }));
        setUsersList(list);
      } catch (error) {
        console.error("שגיאה בשליפת משתמשים:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchMarkedDates = async () => {
      try {
        const snapshot = await getDocs(collection(db, "comments"));
        const dates = snapshot.docs
          .map((d) => d.data().date)
          .filter(Boolean);
        setMarkedDates(new Set(dates));
      } catch (error) {
        console.error("שגיאה בסימון תאריכים ביומן:", error);
      }
    };
    fetchMarkedDates();
  }, []);

  const handleDateChange = async (newDate) => {
    const next = Array.isArray(newDate) ? newDate[0] : newDate;
    setDate(next);
    const dateStr = next.toLocaleDateString("sv-SE");
    setLoadingDayComments(true);
    setShowDayModal(true);
    try {
      const q = query(collection(db, "comments"), where("date", "==", dateStr));
      const snap = await getDocs(q);
      setDayComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setDayComments([]);
    } finally {
      setLoadingDayComments(false);
    }
  };

  /**
   * שומר הערה חדשה ב-Firestore (ומעלה קובץ ל-Storage אם צורף).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const next = {
      campus: fieldError("required", campus, "קמפוס"),
      selectedUser: fieldError("required", selectedUser, "משתמש"),
      noteType: fieldError("required", noteType, "סוג הערה"),
      noteText: fieldError("required", noteText, "תוכן הערה"),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setShowModal(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("אין משתמש מחובר. התחבר כדי להוסיף הערה.");
        setShowModal(false);
        return;
      }

      let fileUrl = null;

      if (file) {
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `commentsFiles/${Date.now()}_${file.name}`
        );
        // מעלה את הקובץ
        await uploadBytes(storageRef, file);
        // מקבל את ה-URL של הקובץ לאחר ההעלאה
        fileUrl = await getDownloadURL(storageRef);
      }

      const commentData = {
        createdBy: `/users/${currentUser?.email || "unknown"}`,
        user: selectedUser,
        campus: `/campuses/${campus}`,
        noteType: `/commentType/${noteType}`,
        noteText: noteText.slice(0, 500),
        selectedItems,
        notifyUsers: notifyUsers?.length ? notifyUsers : [],
        fileName: file ? file.name : null,
        fileUrl, // כאן שומרים את ה-URL של הקובץ שהועלה
        done: false,
        date: date.toLocaleDateString("sv-SE"),
      };

      // שמירה עם מפתח אוטומטי שנוצר ע"י Firebase
      await addDoc(collection(db, "comments"), commentData);
      setMarkedDates((prev) => {
        const next = new Set(prev);
        next.add(commentData.date);
        return next;
      });

      console.log("ההערה נשמרה בהצלחה!");

      // איפוס טופס
      setDate(new Date());
      setCampus("");
      setSelectedUser("");
      setNoteType("");
      setNoteText("");
      setSelectedItems([]);
      setNotifyUsers([]);
      setFile(null);
      setErrors({});
    } catch (error) {
      console.error("שגיאה בשמירת ההערה:", error);
    }

    setTimeout(() => {
      setShowModal(false);
    }, 1500);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="add-comment-page">
      <style>{`
        .add-comment-page {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .add-comment-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          padding-bottom: 18px;
        }

        .add-comment-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 600;
          font-size: 11.5px;
          color: #8A8272;
          margin-bottom: 10px;
        }

        .add-comment-badge span {
          width: 6px; height: 6px; border-radius: 999px; background: #35B6E8;
        }

        .page-title {
          margin: 0;
          font-family: "Heebo", var(--font-sans);
          font-weight: 900;
          font-size: clamp(1.6rem, 4.5vw, 2.2rem);
          letter-spacing: -.8px;
          color: #12203A;
        }

        .add-comment-form {
          display: flex;
          flex-direction: column;
          gap: 22px;
          width: 100%;
        }

        .calendar-section {
          width: 100%;
        }

        .calendar-label {
          font-size: .95rem;
          font-weight: 800;
          color: #12203A;
          margin: 0 0 10px;
        }

        .add-comment-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 18px;
          background: var(--bg-card);
          border: 1px solid var(--line);
          border-radius: 24px;
          box-shadow: 0 18px 40px rgba(18, 32, 58, .07);
          padding: 22px;
          text-align: right;
          overflow: visible;
        }

        .add-comment-fields > :nth-child(n+4) {
          grid-column: 1 / -1;
        }

        @media (max-width: 620px) {
          .add-comment-fields { grid-template-columns: 1fr; }
          .add-comment-fields > :nth-child(n+4) { grid-column: auto; }
        }

        .add-comment-submit-row {
          display: flex;
          gap: 10px;
        }

        .add-comment-submit-row .btn { flex: 1; }

        .day-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18,32,58,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .day-modal {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          width: 100%;
          max-width: 480px;
          max-height: 70vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(18,32,58,0.18);
          direction: rtl;
          text-align: right;
        }

        .day-modal h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0 0 1rem;
          color: #12203A;
        }

        .day-comment-item {
          background: #F7FBFD;
          border: 1px solid #EDE9E3;
          border-radius: var(--radius);
          padding: 0.75rem 1rem;
          margin-bottom: 0.6rem;
          font-size: 0.92rem;
          color: #12203A;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .day-comment-done {
          display: inline-block;
          margin-top: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #2F7D55;
          background: #EDF7F1;
          border-radius: 999px;
          padding: 3px 10px;
        }

        .day-comment-pending {
          display: inline-block;
          margin-top: 0.35rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #B06A12;
          background: #FEF6E7;
          border-radius: 999px;
          padding: 3px 10px;
        }

        .day-modal-empty {
          color: #8A8272;
          font-size: 0.95rem;
          text-align: center;
          padding: 1rem 0;
        }

        .day-modal-footer {
          margin-top: 1rem;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>

      <div className="add-comment-hero">
        <div>
          <div className="add-comment-badge"><span />הערות</div>
          <h2 className="page-title">הערה חדשה</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-comment-form">
        <div className="calendar-section">
          <h3 className="calendar-label">בחרי תאריך ביומן</h3>
          <Calendar
            date={date}
            setDate={handleDateChange}
            markedDates={markedDates}
            markLabel="יש הערות"
          />
        </div>

        <div className="add-comment-fields">
          <SelectInput
            label="קמפוס"
            options={campusOptions.map((campus) => ({
              label: campus.name,
              value: campus.id,
            }))}
            value={campus}
            onChange={(v) => { setCampus(v); setErrors((p) => ({ ...p, campus: "" })); }}
            invalid={Boolean(errors.campus)}
            error={errors.campus}
            hint="בחרי את הקמפוס שאליו שייכת ההערה"
          />

          <SelectInput
            label="עדכון עבור משתמש"
            options={usersList.map((user) => ({
              label: user.name,
              value: user.id,
            }))}
            value={selectedUser}
            onChange={(v) => { setSelectedUser(v); setErrors((p) => ({ ...p, selectedUser: "" })); }}
            invalid={Boolean(errors.selectedUser)}
            error={errors.selectedUser}
            hint="המשתמש שיראה את המשימה בפרופיל"
          />

          <SelectInput
            label="סוג הערה"
            options={commentType.map((type) => ({
              label: type.name,
              value: type.id,
            }))}
            value={noteType}
            onChange={(v) => { setNoteType(v); setErrors((p) => ({ ...p, noteType: "" })); }}
            invalid={Boolean(errors.noteType)}
            error={errors.noteType}
          />

          <TextAreaInput
            value={noteText}
            onChange={(v) => { setNoteText(v); setErrors((p) => ({ ...p, noteText: "" })); }}
            error={errors.noteText}
          />
          <FileUploadInput onChange={setFile} />

          <div className="add-comment-submit-row">
            <button type="submit" className="btn">שמור הערה</button>
          </div>
        </div>
      </form>

      {showModal && <ConfirmationModal onClose={closeModal} />}

      {showDayModal && (
        <div className="day-modal-backdrop" onClick={() => setShowDayModal(false)}>
          <div className="day-modal" onClick={(e) => e.stopPropagation()}>
            <h3>הערות ל-{date.toLocaleDateString("he-IL")}</h3>

            {loadingDayComments ? (
              <p className="day-modal-empty">טוען...</p>
            ) : dayComments.length === 0 ? (
              <p className="day-modal-empty">אין הערות לתאריך זה</p>
            ) : (
              dayComments.map((c) => (
                <div key={c.id} className="day-comment-item">
                  <div>{c.noteText}</div>
                  <span className={c.done ? "day-comment-done" : "day-comment-pending"}>
                    {c.done ? "בוצע" : "ממתין"}
                  </span>
                </div>
              ))
            )}

            <div className="day-modal-footer">
              <button className="btn btn--ghost" onClick={() => setShowDayModal(false)}>סגור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddComment;

// // ==============================================================
// import React, { useState, useEffect } from "react";
// import Calendar from "../components/Calendar";
// import SelectInput from "../components/SelectInput";
// import TextAreaInput from "../components/TextAreaInput";
// import ConfirmationModal from "../components/ConfirmationModal";
// import FileUploadInput from "../components/FileUploadInput";

// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { collection, getDocs, addDoc } from "firebase/firestore";
// import { db } from "../firebase";
// import { getAuth } from "firebase/auth";

// import emailjs from "emailjs-com"; // ודאי שהתקנת npm install emailjs-com

// const AddComment = () => {
//   const [date, setDate] = useState(new Date());
//   const [campus, setCampus] = useState("");
//   const [selectedUser, setSelectedUser] = useState("");
//   const [noteType, setNoteType] = useState("");
//   const [noteText, setNoteText] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [file, setFile] = useState(null);

//   const [usersList, setUsersList] = useState([]);
//   const [campusOptions, setCampusOptions] = useState([]);
//   const [commentType, setCommentType] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [notifyUsers, setNotifyUsers] = useState([]);

//   // --- Fetch Campuses ---
//   useEffect(() => {
//     const fetchCampuses = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "campuses"));
//         const campusList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           name: doc.data().name,
//         }));
//         setCampusOptions(campusList);
//       } catch (error) {
//         console.error("שגיאה בשליפת הקמפוסים:", error);
//       }
//     };
//     fetchCampuses();
//   }, []);

//   // --- Fetch Comment Types ---
//   useEffect(() => {
//     const fetchCommentTypes = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "commentType"));
//         const typesList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           name: doc.data().name,
//         }));
//         setCommentType(typesList);
//       } catch (error) {
//         console.error("שגיאה בשליפת סוגי ההערות:", error);
//       }
//     };
//     fetchCommentTypes();
//   }, []);

//   // --- Fetch Users ---
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "users"));
//         const list = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           name: doc.data().firstName || doc.data().email,
//           email: doc.data().email,
//         }));
//         setUsersList(list);
//       } catch (error) {
//         console.error("שגיאה בשליפת משתמשים:", error);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedUser || !campus || !noteType || !noteText || !date) {
//       alert("נא למלא את כל השדות החובה לפני שמירה.");
//       return;
//     }

//     setShowModal(true);

//     try {
//       const auth = getAuth();
//       const currentUser = auth.currentUser;

//       if (!currentUser) {
//         alert("אין משתמש מחובר.");
//         setShowModal(false);
//         return;
//       }

//       // --- העלאת קובץ אם יש ---
//       let fileUrl = null;
//       if (file) {
//         const storageRef = ref(
//           getStorage(),
//           `commentsFiles/${Date.now()}_${file.name}`
//         );
//         await uploadBytes(storageRef, file);
//         fileUrl = await getDownloadURL(storageRef);
//       }

//       // --- שמירה ב-Firestore ---
//       const commentData = {
//         createdBy: `/users/${currentUser.email}`,
//         user: selectedUser,
//         campus: `/campuses/${campus}`,
//         noteType: `/commentType/${noteType}`,
//         noteText: noteText.slice(0, 500),
//         selectedItems,
//         notifyUsers: notifyUsers?.length ? notifyUsers : [],
//         fileName: file ? file.name : null,
//         fileUrl,
//         date: date.toISOString().split("T")[0],
//       };
//       await addDoc(collection(db, "comments"), commentData);

//       // --- שליחת מייל דרך EmailJS ---
//       const recipient = usersList.find((u) => u.id === selectedUser)?.email;
//       if (recipient) {
//         await emailjs.send(
//           "service_rltw12m", // שירות מ-EmailJS
//           "YOUR_TEMPLATE_ID", // תבנית
//           {
//             to_email: recipient,
//             from_email: currentUser.email,
//             subject: `הערה חדשה מהקמפוס`,
//             message: noteText,
//           },
//           "YOUR_PUBLIC_KEY" // מפתח ציבורי
//         );
//         console.log("האימייל נשלח בהצלחה!");
//       }

//       // --- איפוס טופס ---
//       setDate(new Date());
//       setCampus("");
//       setSelectedUser("");
//       setNoteType("");
//       setNoteText("");
//       setSelectedItems([]);
//       setNotifyUsers([]);
//       setFile(null);

//       console.log("ההערה נשמרה בהצלחה!");
//     } catch (error) {
//       console.error("שגיאה בשמירה או בשליחת המייל:", error);
//     }

//     setTimeout(() => setShowModal(false), 1500);
//   };

//   const closeModal = () => setShowModal(false);

//   return (
//     <div className="add-comment-page">
//       <h2 className="page-title">הוספת הערה ליומן</h2>
//       <form onSubmit={handleSubmit} className="form">
//         <div>
//           <h3 className="calendar-label">בחר תאריך ביומן:</h3>
//           <Calendar value={date} onChange={setDate} />
//         </div>

//         <SelectInput
//           label="קמפוס"
//           options={campusOptions.map((campus) => ({
//             label: campus.name,
//             value: campus.id,
//           }))}
//           value={campus}
//           onChange={setCampus}
//         />

//         <SelectInput
//           label="עדכון עבור משתמש"
//           options={usersList.map((user) => ({
//             label: user.name,
//             value: user.id,
//           }))}
//           value={selectedUser}
//           onChange={setSelectedUser}
//         />

//         <SelectInput
//           label="סוג הערה"
//           options={commentType.map((type) => ({
//             label: type.name,
//             value: type.id,
//           }))}
//           value={noteType}
//           onChange={setNoteType}
//         />

//         <TextAreaInput value={noteText} onChange={setNoteText} />
//         <FileUploadInput onChange={setFile} />

//         <button type="submit" className="btn btn--accent">
//           אישור
//         </button>
//       </form>

//       {showModal && <ConfirmationModal onClose={closeModal} />}
//     </div>
//   );
// };

// export default AddComment;
