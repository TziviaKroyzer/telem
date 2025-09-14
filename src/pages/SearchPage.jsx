import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function SearchPage() {
  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModal = (c) => { setSelectedComment(c); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedComment(null); };

  // users
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
      const m = {};
      list.forEach((u) => m[`/users/${u.id}`] =
        (u.firstName ? `${u.firstName} ` : "") + (u.lastName || u.name || u.email || u.id));
      setUserMap(m);
    })();
  }, []);

  // comment types
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "commentType"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNoteTypes(list);
      const m = {}; list.forEach((t) => m[`/commentType/${t.id}`] = t.name || t.id);
      setNoteTypeMap(m);
    })();
  }, []);

  // campuses
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "campuses"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCampuses(list);
      const m = {}; list.forEach((c) => m[`/campuses/${c.id}`] = c.name || c.id);
      setCampusMap(m);
    })();
  }, []);

  const fetchComments = async () => {
    const base = collection(db, "comments");
    const filters = [];
    if (startDate) filters.push(where("date", ">=", startDate));
    if (endDate) filters.push(where("date", "<=", endDate));
    if (selectedUser) filters.push(where("createdBy", "==", selectedUser));
    if (selectedNoteType) filters.push(where("noteType", "==", `/commentType/${selectedNoteType}`));
    if (selectedCampus) filters.push(where("campus", "==", `/campuses/${selectedCampus}`));

    const q = filters.length ? query(base, ...filters) : query(base);
    const snap = await getDocs(q);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const filtered = searchText.trim()
      ? rows.filter((c) => (c.noteText || "").toLowerCase().includes(searchText.toLowerCase()))
      : rows;

    setComments(filtered);
    setSelectedComment(null);
  };

  const handleSearch = (e) => { e?.preventDefault(); fetchComments(); };
  const clearFilters = () => {
    setStartDate(""); setEndDate(""); setSelectedUser("");
    setSelectedNoteType(""); setSelectedCampus(""); setSearchText("");
    setComments([]);
  };

  return (
    <div className="stack" style={{ gap: "1rem" }}>
      <h1>חיפוש הערות</h1>

      <div className="card">
        <form onSubmit={handleSearch} className="form-grid form-grid--3">
          <div>
            <label>מתאריך</label>
            <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label>עד תאריך</label>
            <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label>לפי משתמש</label>
            <select className="select-input" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">-- כל המשתמשים --</option>
              {users.map((u) => (
                <option key={u.id} value={`/users/${u.id}`}>
                  {(u.firstName ? `${u.firstName} ` : "") + (u.lastName || u.name || u.email || u.id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>סוג הערה</label>
            <select className="select-input" value={selectedNoteType} onChange={(e) => setSelectedNoteType(e.target.value)}>
              <option value="">-- כל הסוגים --</option>
              {noteTypes.map((t) => (<option key={t.id} value={t.id}>{t.name || t.id}</option>))}
            </select>
          </div>
          <div>
            <label>קמפוס</label>
            <select className="select-input" value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)}>
              <option value="">-- כל הקמפוסים --</option>
              {campuses.map((c) => (<option key={c.id} value={c.id}>{c.name || c.id}</option>))}
            </select>
          </div>
          <div>
            <label>טקסט חופשי</label>
            <input type="text" className="input" value={searchText}
              onChange={(e) => setSearchText(e.target.value)} placeholder="חפש לפי תוכן ההערה..." />
          </div>

          <div className="row" style={{ gridColumn: "1 / -1", marginTop: 8 }}>
            <button type="submit" className="btn">חפש</button>
            <button type="button" className="btn btn--ghost" onClick={clearFilters}>נקה</button>
          </div>
        </form>
      </div>

      <div className="stack">
        {comments.map((c) => (
          <div key={c.id} className="search-result" style={{ cursor: "pointer" }} onClick={() => openModal(c)}>
            <p>{(c.noteText || "").substring(0, 120)}...</p>
          </div>
        ))}
      </div>

      {isModalOpen && selectedComment && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>פרטי ההערה</h3>
            <p><strong>תאריך:</strong> {selectedComment.date}</p>
            <p><strong>משתמש:</strong> {userMap[selectedComment.createdBy] || selectedComment.createdBy}</p>
            <p><strong>סוג:</strong> {noteTypeMap[selectedComment.noteType] || selectedComment.noteType}</p>
            <p><strong>קמפוס:</strong> {campusMap[selectedComment.campus] || selectedComment.campus}</p>
            <p><strong>תוכן:</strong> {selectedComment.noteText}</p>
            {selectedComment.fileUrl && (
              <p><strong>קובץ:</strong> <a href={selectedComment.fileUrl} target="_blank" rel="noreferrer">פתח</a></p>
            )}
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={closeModal}>סגור</button>
            </div>
          </div>
        </div>
      )}

      {/* הסטייל ישירות בתוך הקובץ */}
      <style>{`
        .search-result {
          background: #ffffff; /* רקע לבן */
          opacity: 0.9; /* שקיפות קלה */
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: background 0.3s ease;
        }

        .search-result:hover {
          background: #f0f7fd;
        }
      `}</style>
    </div>
  );
}
