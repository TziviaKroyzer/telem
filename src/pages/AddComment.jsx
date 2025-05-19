import React, { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import DatePickerInput from "../components/DatePickerInput";
import SelectInput from "../components/SelectInput";
import TextAreaInput from "../components/TextAreaInput";
import ConfirmationModal from "../components/ConfirmationModal";
import FileUploadInput from "../components/FileUploadInput";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const AddComment = () => {
  const [date, setDate] = useState(null); // עדכון מ-""
  const [campus, setCampus] = useState("");
  const [updateType, setUpdateType] = useState("");
  const [noteType, setNoteType] = useState("");
  const [noteText, setNoteText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);

  const [usersList, setUsersList] = useState([]);
  const [campusOptions, setCampusOptions] = useState([]);
  const [commentType, setCmmentType] = useState([]);
  const [loadingCampuses, setLoadingCampuses] = useState(true);

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const campusCollection = collection(db, "campuses");
        const snapshot = await getDocs(campusCollection);
        const campusList = snapshot.docs.map((doc) => doc.data().name);
        setCampusOptions(campusList);
      } catch (error) {
        console.error("שגיאה בשליפת הקמפוסים:", error);
      } finally {
        setLoadingCampuses(false);
      }
    };
    fetchCampuses();
  }, []);

  useEffect(() => {
    const fetchCommentTypes = async () => {
      try {
        const commentTypeCollection = collection(db, "commentType");
        const snapshot = await getDocs(commentTypeCollection);
        const typesList = snapshot.docs.map((doc) => doc.data().name);
        setCmmentType(typesList);
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
          name: doc.data().displayName || doc.data().email,
        }));
        setUsersList(list);
      } catch (error) {
        console.error("שגיאה בשליפת משתמשים:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 1500);
    console.log("תאריך:", date);
    console.log("קמפוס:", campus);
    console.log("עדכון:", updateType);
    console.log("סוג הערה:", noteType);
    console.log("טקסט חופשי:", noteText);
    if (file) {
      console.log("קובץ שנבחר:", file.name);
    } else {
      console.log("לא נבחר קובץ");
    }
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
          <Calendar value={date} onChange={setDate} /> {/* Calendar */}
        </div>

        <SelectInput
          label="קמפוס"
          options={campusOptions}
          value={campus}
          onChange={setCampus}
        />

        <SelectInput
          label="עדכון עבור משתמש"
          options={usersList.map((user) => user.name)}
          value={updateType}
          onChange={setUpdateType}
        />

        <SelectInput
          label="סוג הערה"
          options={commentType}
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

        .modal-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 50;
        }

        .modal-content {
          background-color: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
          max-width: 24rem;
          width: 100%;
          text-align: center;
        }

        .modal-title {
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default AddComment;
