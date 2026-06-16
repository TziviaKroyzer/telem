// src/components/UserCommentsList.jsx

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
  const [selectedComment, setSelectedComment] = useState(null);
  const [campusMap, setCampusMap] = useState({});
  const [noteTypeMap, setNoteTypeMap] = useState({});

  useEffect(() => {
    const db = getFirestore();
    const loadMaps = async () => {
      const [campSnap, typeSnap] = await Promise.all([
        getDocs(collection(db, "campuses")),
        getDocs(collection(db, "commentType")),
      ]);
      const cm = {};
      campSnap.docs.forEach((d) => { cm[d.id] = d.data().name || d.id; });
      const tm = {};
      typeSnap.docs.forEach((d) => { tm[d.id] = d.data().name || d.id; });
      setCampusMap(cm);
      setNoteTypeMap(tm);
    };
    loadMaps();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      setUserEmail(user ? user.email : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const db = getFirestore();
    setLoading(true);
    const q = query(
      collection(db, "comments"),
      where("user", "==", userEmail),
      where("done", "==", filter === "done")
    );
    getDocs(q)
      .then((snap) =>
        setComments(snap.docs.map((d) => ({ id: d.id, done: false, ...d.data() })))
      )
      .catch((err) => { console.error(err); setComments([]); })
      .finally(() => setLoading(false));
  }, [filter, userEmail]);

  const toggleDone = async (commentId, currentDone) => {
    const db = getFirestore();
    try {
      await updateDoc(doc(db, "comments", commentId), { done: !currentDone });
      setComments((prev) =>
        prev
          .map((c) => (c.id === commentId ? { ...c, done: !currentDone } : c))
          .filter((c) => (filter === "pending" ? !c.done : c.done))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // חילוץ ID מתוך נתיב כמו "/campuses/abc123"
  const extractId = (path) => (path || "").split("/").pop();

  const resolveCampus = (c) => campusMap[extractId(c.campus)] || extractId(c.campus) || "—";
  const resolveType = (c) => noteTypeMap[extractId(c.noteType)] || extractId(c.noteType) || "—";

  return (
    <div className="comments-section">
      <style>{`
        .comments-section { direction: rtl; text-align: right; padding: 0 8px; }

        .filters {
          display: flex;
          gap: 8px;
          margin-bottom: 1rem;
          justify-content: center;
        }
        .filters button {
          padding: .45rem 1.2rem;
          border-radius: 20px;
          border: 1.5px solid #d0dbe8;
          background: #fff;
          color: #637186;
          font-size: .9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all .15s;
        }
        .filters button.active {
          background: #6ec8f1;
          border-color: #6ec8f1;
          color: #fff;
        }

        .comments-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .comment-row {
          background: #fff;
          border: 1px solid #e0eaf3;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          transition: box-shadow .15s;
        }
        .comment-row:hover { box-shadow: 0 4px 14px rgba(0,0,0,.09); }
        .comment-snippet { flex: 1; min-width: 0; font-size: .92rem; color: #2d3a4e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .pending-btn { background: #f4a63f; color: #fff; border: 0; border-radius: 8px; padding: .35rem .85rem; font-size: .82rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .done-btn    { background: #4caf50; color: #fff; border: 0; border-radius: 8px; padding: .35rem .85rem; font-size: .82rem; font-weight: 600; cursor: pointer; white-space: nowrap; }

        .popup-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
        }
        .popup-content {
          background: #fff;
          border-radius: 16px;
          padding: 1.4rem 1.6rem;
          width: 100%; max-width: 500px;
          max-height: 80vh; overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0,0,0,.18);
          direction: rtl; text-align: right;
        }
        .popup-content h3 { margin: 0 0 1rem; font-size: 1.15rem; font-weight: 700; color: #1a2b4a; }

        .detail-row { display: flex; gap: 6px; margin-bottom: .55rem; font-size: .93rem; flex-wrap: wrap; }
        .detail-label { font-weight: 700; color: #4a5568; white-space: nowrap; }
        .detail-value { color: #2d3a4e; }

        .note-text-box {
          background: #f7fafd; border: 1px solid #e0eaf3; border-radius: 10px;
          padding: .75rem 1rem; margin: .5rem 0 1rem;
          white-space: pre-wrap; word-break: break-word;
          font-size: .92rem; color: #2d3a4e; max-height: 160px; overflow-y: auto;
        }
        .status-badge {
          display: inline-block; border-radius: 6px; padding: 2px 10px;
          font-size: .8rem; font-weight: 700; color: #fff; margin-bottom: 1rem;
        }
        .status-done    { background: #4caf50; }
        .status-pending { background: #f4a63f; }

        .popup-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: .5rem; }
      `}</style>

      <div className="filters">
        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>ממתין לביצוע</button>
        <button className={filter === "done"    ? "active" : ""} onClick={() => setFilter("done")}>בוצע</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#7a92b0" }}>טוען...</p>
      ) : comments.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7a92b0" }}>אין הערות להצגה</p>
      ) : (
        <ul className="comments-list">
          {comments.map((c) => (
            <li key={c.id} className="comment-row" onClick={() => setSelectedComment(c)}>
              <span className="comment-snippet">{c.noteText}</span>
              <button
                className={c.done ? "done-btn" : "pending-btn"}
                onClick={(e) => { e.stopPropagation(); toggleDone(c.id, c.done); }}
              >
                {c.done ? "סמן כלא בוצע" : "סמן כבוצע"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedComment && (
        <div className="popup-overlay" onClick={() => setSelectedComment(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>פרטי המשימה</h3>

            <span className={`status-badge ${selectedComment.done ? "status-done" : "status-pending"}`}>
              {selectedComment.done ? "✓ בוצע" : "⏳ ממתין לביצוע"}
            </span>

            {selectedComment.date && (
              <div className="detail-row">
                <span className="detail-label">תאריך:</span>
                <span className="detail-value">{selectedComment.date}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">קמפוס:</span>
              <span className="detail-value">{resolveCampus(selectedComment)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">סוג הערה:</span>
              <span className="detail-value">{resolveType(selectedComment)}</span>
            </div>
            {selectedComment.createdBy && (
              <div className="detail-row">
                <span className="detail-label">נוצר על ידי:</span>
                <span className="detail-value">{extractId(selectedComment.createdBy)}</span>
              </div>
            )}

            <div className="detail-label" style={{ marginBottom: ".3rem" }}>תוכן:</div>
            <div className="note-text-box">{selectedComment.noteText}</div>

            {selectedComment.fileUrl && (
              <div className="detail-row">
                <span className="detail-label">קובץ מצורף:</span>
                <a href={selectedComment.fileUrl} target="_blank" rel="noopener noreferrer">
                  {selectedComment.fileName || "פתח קובץ"}
                </a>
              </div>
            )}
            {selectedComment.imageUrl && (
              <img src={selectedComment.imageUrl} alt="קובץ מצורף" style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "8px" }} />
            )}

            <div className="popup-footer">
              <button
                className={selectedComment.done ? "done-btn" : "pending-btn"}
                onClick={() => { toggleDone(selectedComment.id, selectedComment.done); setSelectedComment(null); }}
              >
                {selectedComment.done ? "סמן כלא בוצע" : "סמן כבוצע"}
              </button>
              <button className="btn btn--ghost" onClick={() => setSelectedComment(null)}>סגור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
