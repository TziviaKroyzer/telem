// src/pages/SearchPage.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function SearchPage() {
  const [comments, setComments] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [selectedUser, setSelectedUser] = useState("");

  const [noteTypes, setNoteTypes] = useState([]);
  const [noteTypeMap, setNoteTypeMap] = useState({});
  const [selectedNoteType, setSelectedNoteType] = useState("");

  const [campuses, setCampuses] = useState([]);
  const [campusMap, setCampusMap] = useState({});
  const [selectedCampus, setSelectedCampus] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
      setUserMap(Object.fromEntries(list.map(u => [`/users/${u.id}`, u.name || u.email || u.id])));
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchNoteTypes = async () => {
      const snapshot = await getDocs(collection(db, "commentType"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNoteTypes(list);
      setNoteTypeMap(Object.fromEntries(list.map(t => [`/commentType/${t.id}`, t.name || t.id])));
    };
    fetchNoteTypes();
  }, []);

  useEffect(() => {
    const fetchCampuses = async () => {
      const snapshot = await getDocs(collection(db, "campuses"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCampuses(list);
      setCampusMap(Object.fromEntries(list.map(c => [`/campuses/${c.id}`, c.name || c.id])));
    };
    fetchCampuses();
  }, []);

  const fetchComments = async () => {
    try {
      let q = collection(db, "comments");
      const filters = [];

      if (startDate) filters.push(where("date", ">=", startDate));
      if (endDate) filters.push(where("date", "<=", endDate));
      if (selectedUser) filters.push(where("createdBy", "==", selectedUser));
      if (selectedNoteType)
        filters.push(where("noteType", "==", `/commentType/${selectedNoteType}`));
      if (selectedCampus)
        filters.push(where("campus", "==", `/campuses/${selectedCampus}`));

      const finalQuery = filters.length ? query(q, ...filters) : query(q);
      const querySnapshot = await getDocs(finalQuery);

      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      let filteredResults = results;
      if (searchText.trim() !== "") {
        filteredResults = results.filter((comment) =>
          comment.noteText?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setComments(filteredResults);
      setSelectedComment(null);
    } catch (error) {
      console.error("שגיאה בשליפת הערות:", error);
    }
  };

  return (
    <div className="search-container">
      <h1>חיפוש הערות</h1>
      <div className="filters">
        <label>
          מתאריך:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          עד תאריך:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <label>
          לפי משתמש:
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- כל המשתמשים --</option>
            {users.map((user) => (
              <option key={user.id} value={`/users/${user.id}`}>
                {user.name || user.email || user.id}
              </option>
            ))}
          </select>
        </label>

        <label>
          סוג הערה:
          <select
            value={selectedNoteType}
            onChange={(e) => setSelectedNoteType(e.target.value)}
          >
            <option value="">-- כל הסוגים --</option>
            {noteTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name || type.id}
              </option>
            ))}
          </select>
        </label>

        <label>
          קמפוס:
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
          >
            <option value="">-- כל הקמפוסים --</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.name || campus.id}
              </option>
            ))}
          </select>
        </label>

        <label>
          טקסט חופשי:
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="חפש לפי תוכן ההערה..."
          />
        </label>

        <button onClick={fetchComments}>חפש</button>
      </div>

      <div className="results">
        {comments.map((comment) => (
          <div
            className="comment-preview"
            key={comment.id}
            onClick={() => setSelectedComment(comment)}
          >
            <p>{comment.noteText?.substring(0, 50)}...</p>
          </div>
        ))}
      </div>

      {selectedComment && (
        <div className="comment-details">
          <h3>פרטי ההערה</h3>
          <p><strong>תאריך:</strong> {selectedComment.date}</p>
          <p><strong>משתמש:</strong> {userMap[selectedComment.createdBy]}</p>
          <p><strong>סוג:</strong> {noteTypeMap[selectedComment.noteType]}</p>
          <p><strong>קמפוס:</strong> {campusMap[selectedComment.campus]}</p>
          <p><strong>תוכן:</strong> {selectedComment.noteText}</p>

          {selectedComment.fileName && (
            <p>
              <strong>קובץ מצורף:</strong>{" "}
              <a href={selectedComment.fileUrl} target="_blank" rel="noopener noreferrer">
                פתח קובץ
              </a>
            </p>
          )}

          {selectedComment.attachments && selectedComment.attachments.length > 0 && (
            <div>
              <strong>קבצים מצורפים:</strong>
              <ul>
                {selectedComment.attachments.map((file, idx) => (
                  <li key={idx}>
                    <a href={file} target="_blank" rel="noopener noreferrer">
                      קובץ {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => setSelectedComment(null)}>סגור</button>
        </div>
      )}

      <style>
        {`
        .search-container {
          padding: 20px;
          direction: rtl;
          font-family: Arial, sans-serif;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 20px;
        }
        .filters label {
          display: flex;
          flex-direction: column;
          font-size: 14px;
        }
        .filters input,
        .filters select {
          padding: 5px;
          font-size: 14px;
          margin-top: 5px;
          min-width: 150px;
        }
        .results {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .comment-preview {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 8px;
          background: #f9f9f9;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .comment-preview:hover {
          background: #e6f7ff;
        }
        .comment-details {
          border: 2px solid #007acc;
          padding: 15px;
          border-radius: 8px;
          background-color: #f0faff;
          margin-top: 20px;
          line-height: 1.6;
        }
        .comment-details h3 {
          margin-top: 0;
        }
        .comment-details ul {
          padding-right: 20px;
        }
        .comment-details button {
          margin-top: 10px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
        }
      `}
      </style>
    </div>
  );
}
