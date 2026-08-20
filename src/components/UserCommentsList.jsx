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

  const resolveCampus = (c) => campusMap[extractId(c.campus)] || extractId(c.campus) || "";
  const resolveType = (c) => noteTypeMap[extractId(c.noteType)] || extractId(c.noteType) || "";

  const dateParts = (dateStr) => {
    if (!dateStr) return { day: "", month: "" };
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return { day: "", month: "" };
    return {
      day: d.getDate(),
      month: d.toLocaleDateString("he-IL", { month: "short" }),
    };
  };

  return (
    <div className="comments-section">
      <style>{`
        .comments-section { direction: rtl; text-align: right; }

        .comments-section .filters {
          display: flex;
          gap: 8px;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
        }
        .comments-section .filters button {
          padding: .5rem 1.1rem;
          border-radius: 999px;
          border: 1.5px solid #EDE9E3;
          background: #fff;
          color: #8A8272;
          font-size: .86rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 40px;
          font-family: inherit;
          transition: background .15s, border-color .15s, color .15s;
        }
        .comments-section .filters button.active {
          background: var(--brand);
          border-color: var(--brand);
          color: #fff;
        }

        .comments-section .comments-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
          gap: 18px;
          max-width: 1080px;
        }
        .comments-section .comments-list li.comment-row {
          background: #FFFEFB;
          border: 1px solid #EDE9E3;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          padding: 22px 24px 18px;
          min-height: 180px;
          max-width: 100%;
          gap: 14px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(18,32,58,.05);
          transition: box-shadow .18s, transform .18s, background .18s;
        }
        .comments-section .comments-list li.comment-row:hover {
          background: #fff;
          box-shadow: 0 14px 32px rgba(18,32,58,.09);
          transform: translateY(-2px);
        }
        .comments-section .comment-row.is-done {
          background: #F7F5F1;
          box-shadow: none;
        }

        .comments-section .comment-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .comments-section .comments-list li span.comment-type {
          font-weight: 700;
          font-size: 11px;
          color: #1F6E96;
          background: #E9F6FC;
          padding: 5px 11px;
          border-radius: 999px;
          overflow: visible;
          text-overflow: unset;
          white-space: nowrap;
          flex: none;
          display: inline-flex;
        }
        .comments-section .comments-list li span.comment-date {
          font-weight: 700;
          font-size: 12px;
          color: #8A5A12;
          background: #FEF6E7;
          padding: 5px 11px;
          border-radius: 999px;
          overflow: visible;
          text-overflow: unset;
          white-space: nowrap;
          flex: none;
          display: inline-flex;
        }
        .comments-section .comment-row.is-done .comment-date {
          background: #EFECE6;
          color: #8A8272;
        }

        .comments-section .comments-list li .comment-snippet,
        .comments-section .comment-snippet {
          margin: 0;
          flex: 1;
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.4;
          color: #12203A;
          white-space: normal;
          overflow: hidden;
          text-overflow: unset;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        .comments-section .comment-row.is-done .comment-snippet {
          color: #8A8272;
          text-decoration: line-through;
          font-weight: 700;
        }

        .comments-section .comment-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
        }
        .comments-section .comments-list li span.comment-campus {
          font-size: 12px;
          font-weight: 600;
          color: #8A8272;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
          display: inline-block;
        }

        .comments-section .comments-list li button.pending-btn,
        .comments-section .comments-list li button.done-btn,
        .comments-section .popup-content button.pending-btn,
        .comments-section .popup-content button.done-btn {
          font-family: inherit;
          cursor: pointer;
          white-space: nowrap;
          flex: none;
          min-height: 40px;
          padding: .5rem 1.15rem;
          border-radius: 999px;
          font-size: .82rem;
          font-weight: 700;
          margin-top: 0;
          transition: background .15s, color .15s, border-color .15s;
        }
        .comments-section .comments-list li button.pending-btn,
        .comments-section .popup-content button.pending-btn {
          background: #F5B93B;
          border: 0;
          color: #12203A;
        }
        .comments-section .comments-list li button.pending-btn:hover,
        .comments-section .popup-content button.pending-btn:hover {
          background: #E5A82C;
        }
        .comments-section .comments-list li button.done-btn,
        .comments-section .popup-content button.done-btn {
          background: transparent;
          border: 1.5px solid #EDE9E3;
          color: #8A8272;
        }
        .comments-section .comments-list li button.done-btn:hover,
        .comments-section .popup-content button.done-btn:hover {
          border-color: #B06A12;
          color: #B06A12;
          background: #FEF6E7;
        }

        .comments-section .comments-empty {
          text-align: center;
          padding: 48px 16px;
          color: #8A8272;
          font-size: .95rem;
          background: #FFFEFB;
          border: 1px dashed #EDE9E3;
          border-radius: 24px;
          max-width: 420px;
        }
        .comments-section .comments-empty p { margin: 0; }

        .comments-section .popup-overlay {
          position: fixed; inset: 0;
          background: rgba(18,32,58,.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
        }
        .comments-section .popup-content {
          background: #FFFEFB;
          border-radius: 24px;
          padding: 1.45rem 1.6rem;
          width: 100%; max-width: 500px;
          max-height: 80vh; overflow-y: auto;
          box-shadow: 0 18px 40px rgba(18,32,58,.16);
          direction: rtl; text-align: right;
        }
        .comments-section .popup-content h3 { margin: 0 0 1rem; font-size: 1.15rem; font-weight: 800; color: #12203A; }
        .comments-section .popup-content button.btn { margin-top: 0; }

        .detail-row { display: flex; gap: 6px; margin-bottom: .55rem; font-size: .93rem; flex-wrap: wrap; }
        .detail-label { font-weight: 700; color: #8A8272; white-space: nowrap; }
        .detail-value { color: #12203A; }

        .note-text-box {
          background: #F7FBFD; border: 1px solid #EDE9E3; border-radius: 16px;
          padding: .75rem 1rem; margin: .5rem 0 1rem;
          white-space: pre-wrap; word-break: break-word;
          font-size: .92rem; color: #12203A; max-height: 160px; overflow-y: auto;
        }
        .status-badge {
          display: inline-block; border-radius: 999px; padding: 4px 10px;
          font-size: .8rem; font-weight: 700; margin-bottom: 1rem;
        }
        .status-done    { background: #EDF7F1; color: #2F7D55; }
        .status-pending { background: #FEF6E7; color: #B06A12; }

        .popup-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: .5rem; }

        @media (max-width: 560px) {
          .comments-section .comments-list {
            grid-template-columns: 1fr;
          }
          .comments-section .comments-list li.comment-row {
            min-height: 0;
          }
        }
      `}</style>

      <div className="filters">
        <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>ממתין לביצוע</button>
        <button className={filter === "done"    ? "active" : ""} onClick={() => setFilter("done")}>בוצע</button>
      </div>

      {loading ? (
        <div className="comments-empty"><p>טוען...</p></div>
      ) : comments.length === 0 ? (
        <div className="comments-empty"><p>אין משימות להצגה</p></div>
      ) : (
        <ul className="comments-list">
          {comments.map((c) => {
            const { day, month } = dateParts(c.date);
            return (
              <li
                key={c.id}
                className={"comment-row" + (c.done ? " is-done" : "")}
                onClick={() => setSelectedComment(c)}
              >
                <div className="comment-top">
                  <span className="comment-type">{resolveType(c)}</span>
                  <span className="comment-date">{day} {month}</span>
                </div>
                <p className="comment-snippet">{c.noteText}</p>
                <div className="comment-foot">
                  <span className="comment-campus">{resolveCampus(c)}</span>
                  <button
                    className={c.done ? "done-btn" : "pending-btn"}
                    onClick={(e) => { e.stopPropagation(); toggleDone(c.id, c.done); }}
                  >
                    {c.done ? "סמן כלא בוצע" : "סמן כבוצע"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedComment && (
        <div className="popup-overlay" onClick={() => setSelectedComment(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>פרטי המשימה</h3>

            <span className={`status-badge ${selectedComment.done ? "status-done" : "status-pending"}`}>
              {selectedComment.done ? "בוצע" : "ממתין לביצוע"}
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
