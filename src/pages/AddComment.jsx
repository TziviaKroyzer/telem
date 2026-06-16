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

  const handleDateChange = async (newDate) => {
    setDate(newDate);
    const dateStr = newDate.toISOString().split("T")[0];
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !campus || !noteType || !noteText || !date) {
      alert("נא למלא את כל השדות החובה לפני שמירה.");
      return;
    }

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
        date: date.toISOString().split("T")[0], // רק תאריך בלי שעה
      };

      // שמירה עם מפתח אוטומטי שנוצר ע"י Firebase
      await addDoc(collection(db, "comments"), commentData);

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
          max-width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }
        .page-title {
          font-size: clamp(1.2rem, 4vw, 1.6rem);
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .calendar-label {
          font-size: clamp(.95rem, 3vw, 1.1rem);
          margin-bottom: .5rem;
        }
        .add-comment-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }
        .calendar-section {
          width: 100%;
          overflow: hidden;
        }

        .day-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .day-modal {
          background: #fff;
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          width: 100%;
          max-width: 480px;
          max-height: 70vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          direction: rtl;
          text-align: right;
        }

        .day-modal h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 1rem;
          color: #1a2b4a;
        }

        .day-comment-item {
          background: #f7fafd;
          border: 1px solid #e0eaf3;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          margin-bottom: 0.6rem;
          font-size: 0.92rem;
          color: #2d3a4e;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .day-comment-done {
          display: inline-block;
          margin-top: 0.35rem;
          font-size: 0.78rem;
          color: #fff;
          background: #4caf50;
          border-radius: 6px;
          padding: 1px 8px;
        }

        .day-comment-pending {
          display: inline-block;
          margin-top: 0.35rem;
          font-size: 0.78rem;
          color: #fff;
          background: #f4a63f;
          border-radius: 6px;
          padding: 1px 8px;
        }

        .day-modal-empty {
          color: #7a92b0;
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

      <h2 className="page-title">הוספת הערה ליומן</h2>
      <form onSubmit={handleSubmit} className="add-comment-form">
        <div className="calendar-section">
          <h3 className="calendar-label">בחר תאריך ביומן:</h3>
          <Calendar date={date} setDate={handleDateChange} />
        </div>

        <SelectInput
          label="קמפוס"
          options={campusOptions.map((campus) => ({
            label: campus.name,
            value: campus.id,
          }))}
          value={campus}
          onChange={setCampus}
        />

        <SelectInput
          label="עדכון עבור משתמש"
          options={usersList.map((user) => ({
            label: user.name,
            value: user.id,
          }))}
          value={selectedUser}
          onChange={setSelectedUser}
        />

        <SelectInput
          label="סוג הערה"
          options={commentType.map((type) => ({
            label: type.name,
            value: type.id,
          }))}
          value={noteType}
          onChange={setNoteType}
        />

        <TextAreaInput value={noteText} onChange={setNoteText} />
        <FileUploadInput onChange={setFile} />

        <button type="submit" className="btn btn--accent" style={{ alignSelf: "flex-start" }}>
          אישור
        </button>
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
