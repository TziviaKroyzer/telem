import React, { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import SelectInput from "../components/SelectInput";
import TextAreaInput from "../components/TextAreaInput";
import ConfirmationModal from "../components/ConfirmationModal";
import FileUploadInput from "../components/FileUploadInput";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { collection, getDocs, addDoc } from "firebase/firestore";
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
      <h2 className="page-title">הוספת הערה ליומן</h2>
      <form onSubmit={handleSubmit} className="form">
        <div>
          <h3 className="calendar-label">בחר תאריך ביומן:</h3>
          <Calendar value={date} onChange={setDate} />
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

        <button type="submit" className="submit-button">
          אישור
        </button>
      </form>

      {showModal && <ConfirmationModal onClose={closeModal} />}

      <style>{`
        .add-comment-page {
          max-width: 36rem;
          margin: 2.5rem auto;
          padding: 1.5rem;
          background-color: white;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          border-radius: 1rem;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .calendar-label {
          font-weight: 600;
        }

        .submit-button {
          width: 100%;
          background-color: #2563eb;
          color: white;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0.375rem;
        }

        .submit-button:hover {
          background-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default AddComment;
