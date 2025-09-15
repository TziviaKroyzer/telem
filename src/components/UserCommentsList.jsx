// // src/components/UserCommentsList.jsx

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function UserCommentsList() {
  const [userEmail, setUserEmail] = useState(null);
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null); // לפופ אפ

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) setUserEmail(user.email);
      else setUserEmail(null);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const db = getFirestore();
    fetchComments(db, userEmail, filter, setComments, setLoading);
  }, [filter, userEmail]);

  async function fetchComments(
    db,
    email,
    currentFilter,
    setCommentsFn,
    setLoadingFn
  ) {
    setLoadingFn(true);
    try {
      let q = query(
        collection(db, "comments"),
        where("user", "==", email),
        where("done", "==", currentFilter === "done")
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        done: d.data().done ?? false,
      }));
      setCommentsFn(list);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setCommentsFn([]);
    } finally {
      setLoadingFn(false);
    }
  }

  const toggleDone = async (commentId, currentDone) => {
    const db = getFirestore();
    try {
      const ref = doc(db, "comments", commentId);
      await updateDoc(ref, { done: !currentDone });

      setComments((prev) =>
        prev
          .map((c) => (c.id === commentId ? { ...c, done: !currentDone } : c))
          .filter((c) => (filter === "pending" ? !c.done : c.done))
      );
    } catch (err) {
      console.error("Error updating done:", err);
    }
  };

  return (
    <div className="comments-section">
      <div className="filters">
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          ממתין לביצוע
        </button>
        <button
          className={filter === "done" ? "active" : ""}
          onClick={() => setFilter("done")}
        >
          בוצע
        </button>
      </div>

      {loading ? (
        <p>טוען...</p>
      ) : comments.length === 0 ? (
        <p>אין הערות להצגה</p>
      ) : (
        <ul className="comments-list">
          {comments.map((c) => (
            <li key={c.id} onClick={() => setSelectedComment(c)}>
              <span>
                {c.noteText.slice(0, 50) +
                  (c.noteText.length > 50 ? "..." : "")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDone(c.id, c.done);
                }}
                className={c.done ? "done-btn" : "pending-btn"}
              >
                {c.done ? "סמן כלא בוצע" : "סמן כבוצע"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* פופ-אפ */}

      {selectedComment && (
        <div className="popup-overlay" onClick={() => setSelectedComment(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>תוכן ההערה</h3>

            {/* טקסט ההערה */}
            {selectedComment.noteText && <p>{selectedComment.noteText}</p>}

            {/* אם יש תמונה */}
            {selectedComment.imageUrl && (
              <div className="note-image">
                <img
                  src={selectedComment.imageUrl}
                  alt="קובץ מצורף"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "8px",
                    marginTop: "10px",
                  }}
                />
              </div>
            )}

            {/* אם יש קובץ (PDF, Word וכו') */}
            {selectedComment.fileUrl && (
              <div className="note-file">
                <a
                  href={selectedComment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  הורד קובץ מצורף
                </a>
              </div>
            )}

            <button onClick={() => setSelectedComment(null)}>סגור</button>
          </div>
        </div>
      )}
    </div>
  );
}
