import React, { useEffect, useMemo, useState } from "react";
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

/**
 * סכימת מסמך בקולקציית "files":
 * - name: string
 * - type: "folder" | "file"
 * - parentId: "root" | <folderId>
 * - userId: uid
 * - url: string (לקובץ)
 * - storagePath: string (נתיב ב-Storage, לקבצים)
 * - size: number (bytes)
 * - mimeType: string
 * - createdAt, updatedAt: serverTimestamp()
 */

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

  const userFilter = useMemo(
    () => (user ? where("userId", "==", user.uid) : null),
    [user]
  );

  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
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
      trail.unshift({ id: snap.id, name: data.name || "—" });
      current = data.parentId;
    }
    trail.unshift({ id: "root", name: "ראשי" });
    return trail;
  };

  const fetchItems = async () => {
    if (!user) return;
    try {
      if (search.trim()) {
        // חיפוש גלובלי של הפריטים של המשתמש
        const qAll = query(collection(db, "files"), userFilter);
        const snap = await getDocs(qAll);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const filtered = all.filter((i) =>
          (i.name || "").toLowerCase().includes(search.trim().toLowerCase())
        );
        filtered.sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return (a.name || "").localeCompare(b.name || "", "he");
        });
        setItems(filtered);
      } else {
        // תוכן התיקיה הנוכחית
        const q = query(
          collection(db, "files"),
          userFilter,
          where("parentId", "==", currentFolder)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return (a.name || "").localeCompare(b.name || "", "he");
        });
        setItems(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItems();
    buildBreadcrumb(currentFolder).then(setBreadcrumb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder, search, user]);

  const enterFolder = (folderId) => {
    setSearch("");
    setCurrentFolder(folderId);
  };

  // הוספת תיקיה
  const addFolder = async () => {
    if (!user) return alert("אין משתמש מחובר");
    const name = prompt("שם תיקיה חדש:");
    if (!name || !name.trim()) return;
    await addDoc(collection(db, "files"), {
      name: name.trim(),
      type: "folder",
      parentId: currentFolder,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    fetchItems();
  };

  // העלאת כמה קבצים יחד
  const uploadFile = () => {
    if (!user) return alert("אין משתמש מחובר");
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true; // חדש: העלאת כמה קבצים
    input.onchange = async () => {
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
          storagePath: path, // נשמור את הנתיב המקורי
          parentId: currentFolder,
          userId: user.uid,
          size: file.size,
          mimeType: file.type,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      fetchItems();
    };
    input.click();
  };

  // גרירה ושחרור – העברת פריט בין תיקיות/פירורי-לחם
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

  // הורדה בטוחה עם fallback
  const fallbackDownload = (item) => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = item.name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadFile = async (item, e) => {
    e.stopPropagation();
    if (!item.url) return;
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
    try {
      if (isImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = item.url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const blob = await new Promise((res) => canvas.toBlob(res));
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const res = await fetch(item.url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch {
      fallbackDownload(item);
    }
  };

  // מחיקה רקורסיבית (עדיפות ל-storagePath, אחרת fallback מ-URL)
  const deleteRecursively = async (itemId) => {
    const snap = await getDoc(doc(db, "files", itemId));
    if (!snap.exists()) return;
    const data = snap.data();

    if (data.type === "folder") {
      const q = query(collection(db, "files"), where("parentId", "==", itemId), userFilter);
      const children = await getDocs(q);
      for (const c of children.docs) {
        await deleteRecursively(c.id);
      }
    }

    if (data.type === "file") {
      try {
        if (data.storagePath) {
          await deleteObject(ref(storage, data.storagePath));
        } else if (data.url) {
          const last = data.url.split("/").pop();     // name.ext?token=...
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

  const removeItem = async (item) => {
    if (!window.confirm(`למחוק את "${item.name}"?`)) return;
    await deleteRecursively(item.id);
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
    <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {breadcrumb.map((b, i) => (
        <button
          key={b.id}
          className="btn btn--ghost"
          onClick={() => enterFolder(b.id)}
          disabled={i === breadcrumb.length - 1}
          title={b.name}
          onDrop={(e) => handleDrop(e, b.id)}
          onDragOver={(e) => e.preventDefault()}
        >
          {b.name}
        </button>
      ))}
    </div>
  );

  const toolbarUI = (
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      <div className="row" style={{ gap: 8 }}>
        <input
          className="input"
          placeholder="חיפוש קבצים ותיקיות…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
        {search && (
          <button className="btn btn--ghost" onClick={() => setSearch("")}>
            נקה
          </button>
        )}
      </div>
      <div className="row" style={{ gap: 8, marginInlineStart: "auto" }}>
        <button className="btn" onClick={addFolder}>הוסף תיקיה</button>
        <button className="btn btn--accent" onClick={uploadFile}>הוסף קובץ</button>
      </div>
    </div>
  );

  return (
    <div className="stack" style={{ gap: "1rem" }}>
      <h1>ניהול קבצים</h1>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          {breadcrumbUI}
          {toolbarUI}
        </div>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {items.length === 0 ? (
          <div className="card empty center">אין קבצים או תיקיות</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="card"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
              onDrop={(e) => item.type === "folder" && handleDrop(e, item.id)}
              onDragOver={(e) => item.type === "folder" && e.preventDefault()}
            >
              <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div
                  className="row"
                  style={{ gap: 10, alignItems: "center", cursor: item.type === "folder" ? "pointer" : "default" }}
                  onClick={() =>
                    item.type === "folder" ? enterFolder(item.id) : window.open(item.url, "_blank")
                  }
                >
                  <span aria-hidden>{item.type === "folder" ? "📁" : "📄"}</span>
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
                      style={{ minWidth: 220 }}
                    />
                  ) : (
                    <strong>{item.name}</strong>
                  )}
                  {item.type === "file" && item.size && (
                    <span className="muted" style={{ marginInlineStart: 8 }}>
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </div>

                <div className="row" style={{ gap: 6 }}>
                  {item.type === "file" && (
                    <button className="btn" onClick={(e) => downloadFile(item, e)} title="הורדה">
                      הורדה
                    </button>
                  )}
                  {renamingId === item.id ? (
                    <>
                      <button className="btn" onClick={saveRename}>שמור</button>
                      <button className="btn btn--ghost" onClick={cancelRename}>בטל</button>
                    </>
                  ) : (
                    <>
                      <button className="btn" onClick={() => startRename(item)}>ערוך</button>
                      <button className="btn btn--danger" onClick={() => removeItem(item)}>מחק</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
