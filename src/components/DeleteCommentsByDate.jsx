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
          align-items: stretch;
          gap: 4px;
        }
        .delete-comments-title {
          font-size: 1.05rem;
          color: #12203A;
          font-weight: 800;
          margin: 0 0 8px;
        }
        .delete-comments-hint {
          font-size: .88rem;
          color: #8A8272;
          margin: 0 0 16px;
        }
        .delete-comments-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .delete-comments-card input[type="date"] {
          font-family: inherit;
          font-size: .95rem;
          border-radius: 999px;
          border: 1.5px solid #EDE9E3;
          background: #FBFAF8;
          padding: 0 16px;
          min-height: 46px;
          color: #12203A;
        }
      `}</style>
      <div className="delete-comments-title">
        מחיקת כל ההערות עד תאריך
      </div>
      <p className="delete-comments-hint">פעולה זו תמחק הערות וקבצים מצורפים עד התאריך שנבחר.</p>
      <div className="delete-comments-inputs">
        <input type="date"
          value={deleteDate}
          onChange={e => setDeleteDate(e.target.value)}
        />
        <button className="btn btn--danger" onClick={handleDeleteComments}>
          מחק עד תאריך
        </button>
      </div>
    </div>
  );
}

export default DeleteCommentsByDate;
