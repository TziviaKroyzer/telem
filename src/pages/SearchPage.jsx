
import { useEffect, useState } from "react";
import { Paperclip, Search } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SelectInput from "../components/SelectInput";

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

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "commentType"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNoteTypes(list);
      const m = {}; list.forEach((t) => m[`/commentType/${t.id}`] = t.name || t.id);
      setNoteTypeMap(m);
    })();
  }, []);

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

  const dateParts = (dateStr) => {
    if (!dateStr) return { day: "", rest: "" };
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString("he-IL", { month: "short" });
    return { day, month };
  };

  return (
    <div className="search-page">
      <div className="search-hero">
        <div className="search-badge"><span />ארכיון הערות</div>
        <h1 className="search-title">חיפוש הערות</h1>

        <form onSubmit={handleSearch} className="search-bar">
          <Search size={18} strokeWidth={2} color="#12203A" />
          <input
            type="text"
            className="search-bar-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="חפש לפי תוכן ההערה..."
          />
          <button type="submit" className="btn">חפש</button>
        </form>

        <div className="search-filters">
          <span className="search-filters-label">סינון</span>
          <SelectInput
            compact
            allowEmpty
            placeholder="כל הקמפוסים"
            value={selectedCampus}
            onChange={setSelectedCampus}
            options={campuses.map((c) => ({ value: c.id, label: c.name || c.id }))}
          />
          <SelectInput
            compact
            allowEmpty
            placeholder="כל הסוגים"
            value={selectedNoteType}
            onChange={setSelectedNoteType}
            options={noteTypes.map((t) => ({ value: t.id, label: t.name || t.id }))}
          />
          <SelectInput
            compact
            allowEmpty
            placeholder="כל המשתמשים"
            value={selectedUser}
            onChange={setSelectedUser}
            options={users.map((u) => ({
              value: `/users/${u.id}`,
              label: (u.firstName ? `${u.firstName} ` : "") + (u.lastName || u.name || u.email || u.id),
            }))}
          />
          <input type="date" className="input search-filter-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="input search-filter-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button type="button" className="search-clear" onClick={clearFilters}>נקה הכל</button>
        </div>
      </div>

      <div className="search-results">
        {comments.length > 0 && (
          <div className="search-results-head">
            <span>{comments.length} תוצאות</span>
          </div>
        )}
        {comments.map((c) => {
          const { day, month } = dateParts(c.date);
          return (
            <div key={c.id} className={"search-result" + (c.done ? " search-result--done" : "")} onClick={() => openModal(c)}>
              <span className="search-result-bar" />
              <div className="search-result-date">
                <div className="search-result-day">{day}</div>
                <div className="search-result-month">{month}</div>
              </div>
              <div className="search-result-body">
                <div className="search-result-meta">
                  <span className="search-result-type">{noteTypeMap[c.noteType] || "הערה"}</span>
                  <span className="search-result-sub">{(campusMap[c.campus] || "")}{userMap[c.createdBy] ? ` · ${userMap[c.createdBy]}` : ""}</span>
                </div>
                <p className="note-snippet">{c.noteText}</p>
              </div>
              <span className={"search-result-status" + (c.done ? " search-result-status--done" : "")}>
                {c.done ? "בוצע" : "ממתין"}
              </span>
            </div>
          );
        })}
        {comments.length === 0 && (
          <div className="search-empty">
            <Search size={28} strokeWidth={1.8} />
            <p>חפשו או סננו כדי להציג הערות</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedComment && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>פרטי ההערה</h3>
            <p><strong>תאריך:</strong> {selectedComment.date}</p>
            <p><strong>משתמש:</strong> {userMap[selectedComment.createdBy] || selectedComment.createdBy}</p>
            <p><strong>סוג:</strong> {noteTypeMap[selectedComment.noteType] || selectedComment.noteType}</p>
            <p><strong>קמפוס:</strong> {campusMap[selectedComment.campus] || selectedComment.campus}</p>
            <div>
              <strong>תוכן:</strong>
              <div className="note-text-box">{selectedComment.noteText}</div>
            </div>

            {selectedComment.fileUrl && (
              <div style={{ marginTop: "1rem" }}>
                <strong>קובץ מצורף:</strong>
                <div className="file-preview">
                  <a href={selectedComment.fileUrl} target="_blank" rel="noreferrer">
                    {selectedComment.fileUrl.match(/\.(jpeg|jpg|png|gif|webp|png)$/i) ? (
                      <img src={selectedComment.fileUrl} alt="preview" className="file-image" />
                    ) : (
                      <div className="file-link">
                        <Paperclip size={15} strokeWidth={2} />
                        פתח קובץ
                      </div>
                    )}
                  </a>
                </div>
              </div>
            )}

            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn btn--ghost" onClick={closeModal}>סגור</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .search-page {
          width: 100%;
          margin: 0 auto;
        }

        .search-hero { padding-bottom: 4px; }

        .search-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-weight: 600;
          font-size: 11.5px;
          color: #8A8272;
          margin-bottom: 12px;
        }

        .search-badge span { width: 6px; height: 6px; border-radius: 999px; background: #F0862A; }

        .search-title {
          margin: 0 0 22px;
          font-family: "Heebo", var(--font-sans);
          font-weight: 900;
          font-size: clamp(1.7rem, 4.5vw, 2.4rem);
          letter-spacing: -.8px;
          color: #12203A;
        }

        .search-bar {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 8px 6px 8px;
          min-height: 62px;
          box-shadow: 0 10px 28px rgba(18,32,58,.06);
        }

        .search-bar svg { margin-inline-start: 10px; flex-shrink: 0; }

        .search-bar-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 1rem;
          color: #12203A;
          min-height: 44px;
        }

        .search-bar .btn {
          flex: none;
          min-width: 96px;
        }

        .search-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 16px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 22px;
          overflow: visible;
          position: relative;
          z-index: 2;
        }

        .search-filters-label {
          font-weight: 700;
          font-size: 12px;
          color: #8A8272;
          margin-inline-end: 2px;
        }

        .search-filter-date {
          width: auto;
          min-height: 42px;
          padding: 0 14px;
          font-size: .88rem;
          border-radius: 999px;
          background: #FBFAF8;
        }

        .search-clear {
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: .82rem;
          color: #8A8272;
          border-bottom: 1px solid #D6D0C4;
          min-height: 36px;
          padding: 0;
          margin-inline-start: auto;
        }

        .search-clear:hover { color: #12203A; border-color: #12203A; }

        .search-results { margin-top: 22px; display: flex; flex-direction: column; gap: 10px; }

        .search-results-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding-bottom: 4px;
          font-weight: 800;
          font-size: .95rem;
          color: #12203A;
        }

        .search-empty {
          text-align: center;
          padding: 56px 16px;
          color: #8A8272;
          font-size: .95rem;
          background: #fff;
          border: 1px dashed #EDE9E3;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .search-empty p { margin: 0; color: #8A8272; }

        .search-result {
          background: #ffffff;
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          gap: 0;
          cursor: pointer;
          transition: background .15s ease, box-shadow .15s ease, transform .15s ease;
        }

        .search-result:hover {
          background: #FEFDFB;
          box-shadow: 0 12px 28px rgba(18,32,58,.08);
          transform: translateY(-1px);
        }

        .search-result-bar { width: 6px; background: #F5B93B; flex: none; }
        .search-result--done .search-result-bar { background: #D6D0C4; }

        .search-result-date {
          flex: none;
          text-align: center;
          padding: 18px 20px;
          border-inline-end: 1px solid #F2EFE9;
          min-width: 72px;
        }

        .search-result-day { font-weight: 900; font-size: 24px; color: #12203A; }
        .search-result--done .search-result-day { color: #B8B2A6; }
        .search-result-month { font-weight: 600; font-size: 11px; color: #8A8272; margin-top: 4px; }

        .search-result-body { flex: 1; min-width: 0; padding: 18px 22px; }

        .search-result-meta { display: flex; align-items: center; gap: 9px; margin-bottom: 6px; flex-wrap: wrap; }

        .search-result-type {
          font-weight: 700;
          font-size: 11px;
          color: #1F6E96;
          background: #E9F6FC;
          padding: 5px 10px;
          border-radius: 999px;
        }

        .search-result-sub { font-size: 12px; color: #8A8272; }

        .note-snippet {
          margin: 0;
          font-weight: 700;
          font-size: 16px;
          line-height: 1.45;
          color: #12203A;
        }

        .search-result--done .note-snippet {
          color: #8A8272;
          text-decoration: line-through;
        }

        .search-result-status {
          flex: none;
          align-self: center;
          margin-inline-end: 18px;
          font-weight: 700;
          font-size: 12px;
          color: #B06A12;
          background: #FEF6E7;
          padding: 7px 12px;
          border-radius: 999px;
        }

        .search-result-status--done { color: #2F7D55; background: #EDF7F1; }

        @media (max-width: 560px) {
          .search-result { flex-wrap: wrap; }
          .search-result-status { margin: 0 16px 14px auto; }
        }

        .note-text-box {
          max-height: 9em;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-word;
          margin-top: 0.5em;
          padding: 0.75em 1em;
          background: #F7FBFD;
          border-radius: var(--radius);
          font-size: .95rem;
        }
        .file-preview { margin-top: 0.5rem; }
        .file-image {
          max-width: 100%;
          max-height: 200px;
          border-radius: var(--radius);
          border: 1px solid var(--line);
          margin-top: 0.5rem;
        }
        .file-link {
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F4F2ED;
          padding: 8px 14px;
          border-radius: var(--radius);
          color: #12203A;
          text-decoration: none;
          min-height: 40px;
        }
      `}</style>
    </div>
  );
}
