import React, { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
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
 * ניהול קבצים – עיצוב אחיד
 * מסמך בקולקציית files:
 *  - name: string
 *  - type: "folder" | "file"
 *  - parentId: "root" | <folderId>
 *  - userId: uid
 *  - url: string (בקובץ)
 *  - createdAt: serverTimestamp()
 */
export default function FileSystem() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [currentFolder, setCurrentFolder] = useState("root");
  const [items, setItems] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([{ id: "root", name: "ראשי" }]);

  const [search, setSearch] = useState("");

  const [renamingId, setRenamingId] = useState(null);
  const [newName, setNewName] = useState("");

  // סינון לפי משתמש
  const userFilter = useMemo(
    () => (user ? where("userId", "==", user.uid) : null),
    [user]
  );

  const fetchItems = async () => {
    if (!user) return;
    try {
      if (search.trim()) {
        // חיפוש בכל העץ למשתמש
        const qAll = query(collection(db, "files"), userFilter);
        const snap = await getDocs(qAll);
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const filtered = all.filter((i) =>
          (i.name || "").toLowerCase().includes(search.trim().toLowerCase())
        );
        setItems(filtered);
      } else {
        // פריטים בתיקיה הנוכחית
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

  useEffect(() => {
    fetchItems();
    buildBreadcrumb(currentFolder).then(setBreadcrumb);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder, search, user]);

  const enterFolder = (folderId) => {
    setSearch("");
    setCurrentFolder(folderId);
  };

  const addFolder = async () => {
    if (!user) return;
    const name = prompt("שם תיקיה חדש:");
    if (!name || !name.trim()) return;
    await addDoc(collection(db, "files"), {
      name: name.trim(),
      type: "folder",
      parentId: currentFolder,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    fetchItems();
  };

  const uploadFile = () => {
    if (!user) return;
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const safeName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `files/${user.uid}/${safeName}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, "files"), {
        name: file.name,
        type: "file",
        url,
        parentId: currentFolder,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      fetchItems();
    };
    input.click();
  };

  const deleteRecursively = async (itemId) => {
    if (!user) return;
    const snap = await getDoc(doc(db, "files", itemId));
    if (!snap.exists()) return;
    const data = snap.data();

    // מחיקה רקורסיבית לתיקיות
    if (data.type === "folder") {
      const q = query(
        collection(db, "files"),
        userFilter,
        where("parentId", "==", itemId)
      );
      const children = await getDocs(q);
      for (const c of children.docs) {
        await deleteRecursively(c.id);
      }
    }

    // מחיקת קובץ מה-Storage
    if (data.type === "file" && data.url) {
      try {
        const last = data.url.split("/").pop();     // name.ext?token=...
        const nameOnly = last.split("?")[0];
        const fileRef = ref(storage, `files/${user.uid}/${nameOnly}`);
        await deleteObject(fileRef);
      } catch (e) {
        console.warn("מחיקה מ-Storage נכשלה (ממשיכים למחוק את המסמך).", e);
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
    await updateDoc(doc(db, "files", renamingId), { name: newName.trim() });
    setRenamingId(null);
    setNewName("");
    fetchItems();
  };

  const cancelRename = () => {
    setRenamingId(null);
    setNewName("");
  };

  // UI
  const showBreadcrumb = (
    <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {breadcrumb.map((b, i) => (
        <button
          key={b.id}
          className="btn btn--ghost"
          onClick={() => enterFolder(b.id)}
          disabled={i === breadcrumb.length - 1}
          title={b.name}
        >
          {b.name}
        </button>
      ))}
    </div>
  );

  const toolbar = (
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

  const grid = (
    <div className="stack" style={{ gap: 8 }}>
      {items.length === 0 ? (
        <div className="card empty center">אין קבצים או תיקיות</div>
      ) : (
        items.map((it) => (
          <div key={it.id} className="card">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <span aria-hidden>{it.type === "folder" ? "📁" : "📄"}</span>
                {renamingId === it.id ? (
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
                  <strong
                    style={{ cursor: it.type === "folder" ? "pointer" : "default" }}
                    onClick={() =>
                      it.type === "folder" ? enterFolder(it.id) : window.open(it.url, "_blank")
                    }
                  >
                    {it.name}
                  </strong>
                )}
              </div>

              <div className="row" style={{ gap: 6 }}>
                {renamingId === it.id ? (
                  <>
                    <button className="btn" onClick={saveRename}>שמור</button>
                    <button className="btn btn--ghost" onClick={cancelRename}>בטל</button>
                  </>
                ) : (
                  <>
                    <button className="btn" onClick={() => startRename(it)}>ערוך</button>
                    <button className="btn btn--danger" onClick={() => removeItem(it)}>מחק</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="stack" style={{ gap: "1rem" }}>
      <h1>ניהול קבצים</h1>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          {showBreadcrumb}
          {toolbar}
        </div>
      </div>

      {grid}
    </div>
  );
}
