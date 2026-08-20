import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Search, Pencil, Trash2, Check, X } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase";


export default function FileSystem() {
  const [user, setUser] = useState(() => getAuth().currentUser);
  useEffect(() => {
    const un = onAuthStateChanged(getAuth(), setUser);
    return () => un();
  }, []);

  const [currentFolder, setCurrentFolder] = useState("root");
  const [items, setItems] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([{ id: "root", name: "ראשי" }]);
  const [search, setSearch] = useState("");

  const [renamingId, setRenamingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);



  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const buildBreadcrumb = async (folderId) => {
    if (folderId === "root") return [{ id: "root", name: "ראשי" }];
    const trail = [];
    let current = folderId;
    while (current && current !== "root") {
      const snap = await getDoc(doc(db, "files", current));
      if (!snap.exists()) break;
      const data = snap.data();
      trail.unshift({ id: snap.id, name: data.name || "" });
      current = data.parentId;
    }
    trail.unshift({ id: "root", name: "ראשי" });
    return trail;
  };
/**
 * טוען קבצים ותיקיות לפי התיקיה הנוכחית, או לפי חיפוש שם.
 */
const fetchItems = useCallback(async () => {
  setLoadingItems(true);
  try {
    let snap;
    if (search.trim()) {
      const searchText = search.trim();
      if (!searchText) {
        setItems([]);
        return;
      }
      const qAll = query(
        collection(db, "files"),
        where("name", ">=", searchText),
        where("name", "<=", searchText + "\uf8ff")
      );
      snap = await getDocs(qAll);
    } else {
      const q = query(
        collection(db, "files"),
        where("parentId", "==", currentFolder)
      );
      snap = await getDocs(q);
    }

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return (a.name || "").localeCompare(b.name || "", "he");
    });
    setItems(list);
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingItems(false);
  }
}, [search, currentFolder]); // ← שימי לב, הוספתי תלות





 useEffect(() => {
  fetchItems();
  buildBreadcrumb(currentFolder).then(setBreadcrumb);
}, [fetchItems, currentFolder, user]);


  const enterFolder = (folderId) => {
    setSearch("");
    setCurrentFolder(folderId);
  };


  const addFolder = () => {
    if (!user) return alert("אין משתמש מחובר");
    setFolderName("");
    setFolderOpen(true);
  };

  const saveFolder = async () => {
    if (!user) return;
    const name = folderName.trim();
    if (!name) return;
    await addDoc(collection(db, "files"), {
      name,
      type: "folder",
      parentId: currentFolder,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setFolderOpen(false);
    setFolderName("");
    fetchItems();
  };

 
  const uploadFile = () => {
  if (!user) return alert("אין משתמש מחובר");
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;

  input.onchange = async () => {
    setUploading(true);
    try {
      const files = Array.from(input.files || []);
      if (!files.length) return;

      for (const file of files) {
        const unique = `${Date.now()}_${file.name}`;
        const path = `files/${user.uid}/${unique}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, "files"), {
          name: file.name,
          type: "file",
          url,
          storagePath: path,
          parentId: currentFolder,
          userId: user.uid,
          size: file.size,
          mimeType: file.type,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      fetchItems(); 
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  input.click();
};



  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId || itemId === targetFolderId) return;
    await updateDoc(doc(db, "files", itemId), {
      parentId: targetFolderId,
      updatedAt: serverTimestamp(),
    });
    fetchItems();
  };

  const fallbackDownload = (item) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };



  const deleteRecursively = async (itemId) => {
    const snap = await getDoc(doc(db, "files", itemId));
    if (!snap.exists()) return;
    const data = snap.data();

    if (!user) return;
    const q = query(
      collection(db, "files"),
      where("parentId", "==", itemId)
    );


    const children = await getDocs(q);
    for (const c of children.docs) {
      await deleteRecursively(c.id);
    }


    if (data.type === "file") {
      try {
        if (data.storagePath) {
          await deleteObject(ref(storage, data.storagePath));
        } else if (data.url) {
          const last = data.url.split("/").pop(); // name.ext?token=...
          const nameOnly = (last || "").split("?")[0];
          if (user) {
            await deleteObject(ref(storage, `files/${user.uid}/${nameOnly}`));
          }
        }
      } catch (e) {
        console.warn("מחיקה מ-Storage נכשלה (ממשיכים למחוק את הרשומה).", e);
      }
    }

    await deleteDoc(doc(db, "files", itemId));
  };

  const removeItem = (item) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    await deleteRecursively(deleteItem.id);
    setDeleteItem(null);
    fetchItems();
  };

  const startRename = (item) => {
    setRenamingId(item.id);
    setNewName(item.name || "");
  };

  const saveRename = async () => {
    if (!renamingId) return;
    if (!newName.trim()) return cancelRename();
    await updateDoc(doc(db, "files", renamingId), {
      name: newName.trim(),
      updatedAt: serverTimestamp(),
    });
    setRenamingId(null);
    setNewName("");
    fetchItems();
  };

  const cancelRename = () => {
    setRenamingId(null);
    setNewName("");
  };

  // UI – עיצוב אחיד של האתר (.card / .btn / .input / .row / .stack)
  const breadcrumbUI = (
    <div className="fs-breadcrumb-nav">
      {breadcrumb.map((b, i) => (
        <React.Fragment key={b.id}>
          <button
            className="btn btn--ghost fs-crumb-btn"
            onClick={() => enterFolder(b.id)}
            disabled={i === breadcrumb.length - 1}
            title={b.name}
            onDrop={(e) => i !== breadcrumb.length - 1 && handleDrop(e, b.id)}
            onDragOver={(e) => e.preventDefault()}
          >
            {b.name}
          </button>
          {i < breadcrumb.length - 1 && (
            <span className="fs-crumb-sep">/</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const toolbarUI = (
    <div className="fs-toolbar">
      <div className="fs-search-row">
        <div className="fs-search-wrap">
          <Search size={18} strokeWidth={2} />
          <input
            className="input"
            placeholder="חיפוש קבצים ותיקיות…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button className="btn btn--ghost" onClick={() => setSearch("")}>
            נקה
          </button>
        )}
      </div>
      <div className="fs-actions-row">
        <button className="btn" onClick={addFolder}>
          תיקיה חדשה
        </button>
        <button className="btn btn--accent" onClick={uploadFile}>
          העלה קובץ
        </button>
      </div>
    </div>
  );

  return (
    <div className="fs-page">
      <style>{`
  .fs-page {
    width: 100%;
    margin: 0 auto;
  }

  .fs-hero { padding-bottom: 18px; }

  .fs-toolbar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  @media (min-width: 720px) {
    .fs-toolbar {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .fs-search-row {
    display: flex;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .fs-search-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #FBFAF8;
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0 14px;
    min-height: 48px;
  }

  .fs-search-wrap svg { color: #8A8272; flex-shrink: 0; }

  .fs-search-wrap .input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    padding: 0;
    min-height: 44px;
  }

  .fs-actions-row {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .fs-breadcrumb-toolbar {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .fs-breadcrumb-nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 4px;
    min-width: 0;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .fs-breadcrumb-nav::-webkit-scrollbar { display: none; }

  .fs-crumb-btn {
    white-space: nowrap;
    flex-shrink: 0;
    padding: .4rem .85rem !important;
    min-height: 38px !important;
    font-size: .88rem !important;
    border-radius: 999px !important;
  }

  .fs-crumb-sep {
    flex-shrink: 0;
    color: #C9C3B7;
    font-size: .9rem;
    padding: 0 2px;
    user-select: none;
  }

  .file-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: nowrap;
    width: 100%;
    min-width: 0;
  }

  .file-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .file-icon {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
  }

  .file-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
    font-weight: 600;
    font-size: .95rem;
    color: #12203A;
  }

  .file-size {
    flex-shrink: 0;
    font-size: .78rem;
    color: #8A8272;
    white-space: nowrap;
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .file-action {
    background: none;
    border: 0;
    cursor: pointer;
    color: #9A9386;
    width: 34px;
    height: 34px;
    min-height: 34px;
    padding: 0;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .file-action:hover { color: #12203A; background: #F4F2ED; }
  .file-action--danger:hover { color: #C4534E; background: #FDF2F0; }
  .file-action--save:hover { color: #2F7D55; background: #EDF7F1; }

  .fs-item {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 14px 16px;
  }

  .fs-toolbar-card {
    padding: 16px 18px 18px;
    margin-bottom: 18px;
  }

  .fs-list { display: flex; flex-direction: column; }

  .fs-list-panel {
    background: #fff;
    border: 1px solid var(--line);
    border-radius: 16px;
    overflow: hidden;
  }

  .fs-row-item {
    padding: 13px 18px;
    border: 0;
    border-radius: 0;
    background: transparent;
    border-bottom: 1px solid #F2EFE9;
  }

  .fs-row-item:last-child { border-bottom: 0; }

  .fs-row-item:hover { background: #FBFAF8; }

  .fs-empty {
    text-align: center;
    padding: 40px 16px;
    color: #8A8272;
  }

  .fs-dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(18,32,58,.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
    padding: 16px;
  }

  .fs-dialog {
    width: 100%;
    max-width: 420px;
    background: #FFFEFB;
    border: 1px solid #EDE9E3;
    border-radius: 24px;
    box-shadow: 0 18px 40px rgba(18,32,58,.16);
    padding: 1.4rem 1.5rem 1.25rem;
    direction: rtl;
    text-align: right;
  }

  .fs-dialog h3 {
    margin: 0 0 8px;
    font-size: 1.15rem;
    font-weight: 800;
    color: #12203A;
  }

  .fs-dialog p {
    margin: 0 0 16px;
    font-size: .92rem;
    color: #8A8272;
  }

  .fs-dialog .input {
    border-radius: 14px;
    background: #FBFAF8;
    margin-bottom: 16px;
  }

  .fs-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
`}</style>

      <div className="fs-hero">
        <div className="page-badge"><span />מסמכים</div>
        <h1 className="page-title">ניהול קבצים</h1>
      </div>

      <div className="fs-item fs-toolbar-card">
        <div className="fs-breadcrumb-toolbar">
          {breadcrumbUI}
          {toolbarUI}
        </div>
      </div>

      <div className="fs-list">
  {loadingItems ? (
    <div className="fs-item fs-empty">טוען קבצים...</div>
  ) : uploading ? (
    <div className="fs-item fs-empty">טוען קובץ...</div>
  ) : items.length === 0 ? (
    <div className="fs-item fs-empty">אין קבצים או תיקיות</div>
        ) : (
          <div className="fs-list-panel">
          {items.map((item) => (
            <div
              key={item.id}
              className="fs-row-item"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
              onDrop={(e) => item.type === "folder" && handleDrop(e, item.id)}
              onDragOver={(e) => item.type === "folder" && e.preventDefault()}
            >
              <div className="file-row">
                <div
                  className="file-name"
                  onClick={() => {
                    if (renamingId === item.id) return;
                    if (item.type === "folder") enterFolder(item.id);
                    else window.open(item.url, "_blank");
                  }}
                >
                  <span className="file-icon" aria-hidden>
                    {item.type === "folder" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8272" strokeWidth="1.4" strokeLinejoin="round">
                        <path d="M3 8h6.2l1.6 2H21v9.2a.8.8 0 0 1-.8.8H3.8A.8.8 0 0 1 3 19.2V8z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8272" strokeWidth="1.4" strokeLinejoin="round">
                        <path d="M7 3.8h7.2L20 9.6V20.2a.8.8 0 0 1-.8.8H7.8A.8.8 0 0 1 7 20.2V3.8z" />
                        <path d="M14.2 3.8V9.6H20" />
                      </svg>
                    )}
                  </span>
                  {renamingId === item.id ? (
                    <input
                      className="input"
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename();
                        if (e.key === "Escape") cancelRename();
                      }}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                  ) : (
                    <span className="file-name-text" title={item.name}>
                      {item.name}
                    </span>
                  )}
                  {item.type === "file" && item.size && (
                    <span className="file-size">
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </div>

                <div className="file-actions">
                  {renamingId === item.id ? (
                    <>
                      <button className="file-action file-action--save" title="שמירה" aria-label="שמירה" onClick={saveRename}>
                        <Check size={16} strokeWidth={1.7} />
                      </button>
                      <button className="file-action" title="ביטול" aria-label="ביטול" onClick={cancelRename}>
                        <X size={16} strokeWidth={1.7} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="file-action" title="שינוי שם" aria-label="שינוי שם" onClick={() => startRename(item)}>
                        <Pencil size={16} strokeWidth={1.6} />
                      </button>
                      <button className="file-action file-action--danger" title="מחיקה" aria-label="מחיקה" onClick={() => removeItem(item)}>
                        <Trash2 size={16} strokeWidth={1.6} />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
          </div>
        )}
      </div>

      {folderOpen && (
        <div className="fs-dialog-overlay" onClick={() => setFolderOpen(false)}>
          <div className="fs-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>תיקיה חדשה</h3>
            <p>בחרי שם לתיקיה</p>
            <input
              className="input"
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveFolder();
                if (e.key === "Escape") setFolderOpen(false);
              }}
              placeholder="שם התיקיה"
            />
            <div className="field-hint">למשל: דוחות, תמונות, טפסים</div>
            <div className="fs-dialog-actions">
              <button className="btn btn--ghost" type="button" onClick={() => setFolderOpen(false)}>ביטול</button>
              <button className="btn btn--accent" type="button" onClick={saveFolder}>יצירה</button>
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="fs-dialog-overlay" onClick={() => setDeleteItem(null)}>
          <div className="fs-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>מחיקה</h3>
            <p>למחוק את "{deleteItem.name}"?</p>
            <div className="fs-dialog-actions">
              <button className="btn btn--ghost" type="button" onClick={() => setDeleteItem(null)}>ביטול</button>
              <button className="btn btn--danger" type="button" onClick={confirmDelete}>מחיקה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
