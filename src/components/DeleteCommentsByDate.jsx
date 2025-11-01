import React, { useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";

function DeleteCommentsByDate() {
  const [deleteDate, setDeleteDate] = useState("");

  const handleDeleteComments = async () => {
    if (!window.confirm(`האם אתה בטוח? כל ההערות והקבצים עד ${deleteDate} ימחקו!`)) return;
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, where("date", "<=", deleteDate));
    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (data.fileUrl) {
        try {
          const url = new URL(data.fileUrl);
          const path = decodeURIComponent(url.pathname.split("/o/")[1].split("?")[0]);
          const fileRef = ref(storage, path);
          await deleteObject(fileRef);
        } catch (err) {}
      }
      await deleteDoc(doc(commentsRef, docSnap.id));
    }
    alert("כל ההערות והקבצים עד התאריך שבחרת נמחקו.");
  };

  return (
    <div className="admin-card delete-comments-card">
      <style>{`
        .delete-comments-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        
         
        }
        .delete-comments-title {
          font-size: 1.2rem;
          color: #0588d8;
          font-weight: 800;
          margin-bottom: 2rem;
        }
        .delete-comments-inputs {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .delete-comments-btn {
          background-color: #0588d8;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 20px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          margin-right: 8px;
          transition: background 0.2s;
        }
        .delete-comments-btn:hover {
          background-color: #0673b7;
        }
        .delete-comments-card input[type="date"] {
          font-size: 1rem;
          border-radius: 6px;
          border: 1.5px solid #aae2fd;
          padding: 7px 14px;
        }
      `}</style>
      <div className="delete-comments-title">
        מחיקת כל ההערות עד תאריך
      </div>
      <div className="delete-comments-inputs">
        <button className="delete-comments-btn" onClick={handleDeleteComments}>
          מחק עד תאריך
        </button>
        <input type="date"
          value={deleteDate}
          onChange={e => setDeleteDate(e.target.value)}
        />
      </div>
    </div>
  );
}

export default DeleteCommentsByDate;
