// FileSystem.jsx – מערכת ניהול קבצים עם חיפוש מתקדם ומחיקה רקורסיבית
import logo from "../assets/logo.webp";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { db, auth, storage } from "../firebase";

function FileSystem() {
  const [user, setUser] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState("root");
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [renamingItem, setRenamingItem] = useState(null);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInWithPopup(auth, new GoogleAuthProvider());
    });
    return () => unsubscribe();
  }, []);

  const fetchItems = async () => {
    const q = query(
      collection(db, "files"),
      where("parentId", "==", currentFolderId),
      where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(results);
    updateBreadcrumb(currentFolderId);
  };

  const updateBreadcrumb = async (folderId) => {
    if (folderId === "root") {
      setBreadcrumb([{ id: "root", name: "ראשי" }]);
      return;
    }
    const path = [];
    let currentId = folderId;
    while (currentId && currentId !== "root") {
      const docRef = doc(db, "files", currentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        path.unshift({ id: currentId, name: data.name });
        currentId = data.parentId;
      } else {
        break;
      }
    }
    path.unshift({ id: "root", name: "ראשי" });
    setBreadcrumb(path);
  };

  // פילטור פריטים לפי חיפוש
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [items, searchQuery]);

  useEffect(() => {
    if (!user) return;
    fetchItems();
  }, [currentFolderId, user]);

  const createFolder = async () => {
    const docRef = await addDoc(collection(db, "files"), {
      name: "תיקיה חדשה",
      type: "folder",
      parentId: currentFolderId,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    setRenamingItem(docRef.id);
    setNewName("תיקיה חדשה");
    fetchItems();
  };

  const uploadFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const fileRef = ref(storage, `files/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        const docRef = await addDoc(collection(db, "files"), {
          name: file.name,
          type: "file",
          url,
          parentId: currentFolderId,
          userId: user.uid,
          size: file.size,
          createdAt: serverTimestamp(),
        });
        setRenamingItem(docRef.id);
        setNewName(file.name);
        fetchItems();
      } catch (err) {
        alert("שגיאה בהעלאת הקובץ");
      }
    };
    input.click();
  };

  const renameItem = async (itemId) => {
    if (!newName.trim()) {
      setRenamingItem(null);
      return;
    }
    const itemRef = doc(db, "files", itemId);
    await updateDoc(itemRef, { name: newName.trim() });
    setRenamingItem(null);
    setNewName("");
    fetchItems();
  };

  // פונקציה רקורסיבית למחיקת כל התוכן של תיקיה
  const deleteItemRecursively = async (itemId) => {
    try {
      // קודם נשיג את הפריט לבדיקה
      const itemRef = doc(db, "files", itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (!itemSnap.exists()) {
        console.log(`פריט ${itemId} לא קיים`);
        return;
      }

      const itemData = itemSnap.data();

      // אם זה תיקיה, מוחקים קודם את כל התוכן שלה
      if (itemData.type === "folder") {
        console.log(`מוחק תוכן של תיקיה: ${itemData.name}`);
        
        // מוצאים את כל הפריטים בתיקיה
        const q = query(
          collection(db, "files"),
          where("parentId", "==", itemId),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        
        // מוחקים כל פריט בתיקיה באופן רקורסיבי
        const deletePromises = snapshot.docs.map(async (docSnap) => {
          await deleteItemRecursively(docSnap.id);
        });
        
        await Promise.all(deletePromises);
      }

      // אחרי מחיקת התוכן (אם זה תיקיה), מוחקים את הפריט עצמו
      console.log(`מוחק פריט: ${itemData.name} (${itemData.type})`);

      // אם זה קובץ, מוחקים גם מ-Storage
      if (itemData.type === "file" && itemData.url) {
        try {
          // מנסים לחלץ את שם הקובץ מה-URL
          const urlParts = itemData.url.split('/');
          const fileNameWithParams = urlParts[urlParts.length - 1];
          const fileName = fileNameWithParams.split('?')[0];
          
          const fileRef = ref(storage, `files/${user.uid}/${fileName}`);
          await deleteObject(fileRef);
          console.log(`קובץ נמחק מ-Storage: ${fileName}`);
        } catch (storageError) {
          console.warn(`שגיאה במחיקת קובץ מ-Storage:`, storageError);
          // ממשיכים למחוק מ-Firestore גם אם נכשל ב-Storage
        }
      }

      // מוחקים את הפריט מ-Firestore
      await deleteDoc(itemRef);
      console.log(`פריט נמחק מ-Firestore: ${itemData.name}`);

    } catch (error) {
      console.error(`שגיאה במחיקת פריט ${itemId}:`, error);
      throw error;
    }
  };

  const deleteItem = async (itemId) => {
    // מוצאים את הפריט כדי להציג שם נכון בהודעת האישור
    const itemRef = doc(db, "files", itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (!itemSnap.exists()) {
      alert("הפריט לא נמצא");
      return;
    }

    const itemData = itemSnap.data();
    const isFolder = itemData.type === "folder";
    
    // הודעת אישור שונה לתיקיות
    const confirmMessage = isFolder 
      ? `האם להסיר את התיקיה "${itemData.name}" ואת כל התוכן שלה?`
      : `האם להסיר את הקובץ "${itemData.name}"?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteItemRecursively(itemId);
      console.log("מחיקה הושלמה בהצלחה");
      fetchItems(); // רענון הרשימה
    } catch (error) {
      console.error("שגיאה במחיקה:", error);
      alert("שגיאה במחיקת הפריט. נסה שוב.");
    }
  };

  const handleDrop = async (e, targetFolderId) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId || itemId === targetFolderId) return;
    const itemRef = doc(db, "files", itemId);
    await updateDoc(itemRef, { parentId: targetFolderId });
    fetchItems();
  };

  const startRename = (item) => {
    setRenamingItem(item.id);
    setNewName(item.name);
  };

  const handleItemClick = (item) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
    } else {
      // פתיחת קובץ במקום הורדה
      window.open(item.url, "_blank");
    }
  };

  const downloadFile = async (item, e) => {
    e.stopPropagation();
    
    // בדיקה אם זה תמונה
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
    
    if (isImage) {
      // עבור תמונות - שיטה מיוחדת
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.crossOrigin = 'anonymous';
        img.onload = function() {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(function(blob) {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = item.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
          });
        };
        
        img.onerror = function() {
          // אם נכשל, ננסה דרך fetch
          fallbackDownload(item);
        };
        
        img.src = item.url;
        
      } catch (error) {
        console.error('שגיאה בהורדת תמונה:', error);
        fallbackDownload(item);
      }
    } else {
      // עבור קבצים רגילים
      try {
        const response = await fetch(item.url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } catch (error) {
        console.error('שגיאה בהורדת קובץ:', error);
        fallbackDownload(item);
      }
    }
  };

  const fallbackDownload = (item) => {
    // פתרון גיבוי - יצירת link זמני
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.name;
    a.target = '_blank';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <div className="logo-top-right-wrapper">
        <img src={logo} alt="לוגו" className="logo-top-right" />
      </div>
      <div className="file-system">
        <h1>📁 ניהול קבצים</h1>

        <div className="breadcrumb">
          {breadcrumb.map((b, i) => (
            <span
              key={b.id}
              onDrop={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const itemId = e.dataTransfer.getData("text/plain");
                if (!itemId || itemId === b.id) return;
                if (b.id !== currentFolderId) {
                  if (window.confirm(`האם להעביר את הפריט אל "${b.name}"?`)) {
                    handleDrop(e, b.id);
                  }
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              style={{ display: "inline-block" }}
            >
              <button onClick={() => setCurrentFolderId(b.id)} className="breadcrumb-btn">
                {b.name}
              </button>
              {i < breadcrumb.length - 1 && <span> / </span>}
            </span>
          ))}
        </div>

        <div className="controls">
          <div className="action-buttons">
            <button onClick={uploadFile} className="btn upload-btn">
              <span className="btn-icon">📄</span> הוסף קובץ
            </button>
            <button onClick={createFolder} className="btn folder-btn">
              <span className="btn-icon">📁</span> הוסף תיקיה
            </button>
          </div>
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="🔍 חיפוש קבצים ותיקיות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input" />
              {searchQuery && (
                <button onClick={clearSearch} className="clear-search-btn" title="נקה חיפוש">
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="file-list">
          {filteredItems.length === 0 ? (
            <div className="empty">
              {searchQuery ? `לא נמצאו פריטים המכילים "${searchQuery}"` : "אין קבצים או תיקיות"}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`file-item ${item.type}`}
                draggable={true}
                onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
                onDrop={(e) => item.type === "folder" && handleDrop(e, item.id)}
                onDragOver={(e) => item.type === "folder" && e.preventDefault()}
                onClick={() => handleItemClick(item)}
              >
                <div className="file-icon">
                  {item.type === "folder" ? (
                    <span className="folder-gradient">📁</span>
                  ) : (
                    <span className="file-gradient">📄</span>
                  )}
                </div>

                <div className="file-name">
                  {renamingItem === item.id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => renameItem(item.id)}
                      onKeyDown={(e) => e.key === "Enter" && renameItem(item.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <span>{item.name}</span>
                  )}
                </div>

                <div className="file-actions">
                  <button
                    onClick={(e) => { e.stopPropagation(); startRename(item); }}
                    className="action-btn rename"
                    title="שנה שם"
                  >
                    <span role="img" aria-label="rename">✏️</span>
                  </button>
                  {item.type === "file" && (
                    <button
                      onClick={(e) => downloadFile(item, e)}
                      className="action-btn download"
                      title="הורד קובץ"
                    >
                      <span role="img" aria-label="download">⬇️</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    className="action-btn delete"
                    title="מחק"
                  >
                    <span role="img" aria-label="delete">🗑️</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <style>{`
  .logo-top-right-wrapper {
    position: absolute;
    top: 24px;
    right: 32px;
    z-index: 10;
    display: flex;
    justify-content: flex-end;
    width: 100%;
    pointer-events: none;
  }
  .logo-top-right {
    max-width: 80px;
    max-height: 80px;
    opacity: 0.98;
    display: block;
    pointer-events: auto;
    filter: drop-shadow(0 2px 8px #6ec8f155);
  }
  .file-system {
    padding: 2.5em 1.5em 2em 1.5em;
    background: linear-gradient(135deg, #e3f6fc 0%, #f7fafd 100%);
    min-height: 100vh;
    font-family: "Segoe UI", Tahoma, sans-serif;
    position: relative;
    border-radius: 24px;
    box-shadow: 0 8px 32px 0 #6ec8f122;
    max-width: 700px;
    margin: 2em auto;
  }

  h1 {
    color: #2e90c9;
    text-align: center;
    margin-bottom: 2em;
    font-size: 2.2em;
    letter-spacing: 0.02em;
    font-weight: 800;
    text-shadow: 0 2px 8px #6ec8f133;
  }

  .breadcrumb {
    margin-bottom: 1.2em;
    color: #7a7a7a;
    font-size: 1.05em;
    background: #f0f7fa;
    border-radius: 10px;
    padding: 0.5em 1em;
    box-shadow: 0 1px 4px #6ec8f111;
    display: flex;
    flex-wrap: wrap;
    gap: 0.2em;
  }

  .breadcrumb-btn {
    background: none;
    border: none;
    color: #2e90c9;
    font-weight: bold;
    cursor: pointer;
    font-size: 1em;
    transition: color 0.2s;
    border-radius: 6px;
    padding: 0 0.3em;
  }
  .breadcrumb-btn:hover {
    color: #0e6fa7;
    background: #e3f6fc;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1.2em;
    margin-bottom: 2em;
    background: #ffffffcc;
    border-radius: 14px;
    box-shadow: 0 2px 8px #6ec8f111;
    padding: 1em 1.2em;
  }

  .action-buttons {
    display: flex;
    gap: 1em;
  }

  .btn {
    padding: 0.7em 1.3em;
    background: linear-gradient(90deg, #6ec8f1 60%, #2e90c9 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.08em;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 2px 8px #6ec8f122;
    transition: background 0.18s, box-shadow 0.18s;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
  .btn-icon {
    font-size: 1.2em;
    margin-left: 0.2em;
  }
  .btn:hover {
    background: linear-gradient(90deg, #2e90c9 60%, #6ec8f1 100%);
    box-shadow: 0 4px 16px #6ec8f133;
  }

  .search-container {
    flex: 1;
    max-width: 340px;
    min-width: 180px;
  }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    background: #f7fafd;
    border-radius: 10px;
    border: 1.5px solid #d0e7f7;
    padding: 0.2em 0.6em;
    box-shadow: 0 1px 4px #6ec8f111;
  }

  .search-input {
    flex: 1;
    padding: 0.6em 0.8em;
    border: none;
    border-radius: 10px;
    font-size: 1.05em;
    background: transparent;
    outline: none;
    color: #2e90c9;
    font-weight: 500;
  }

  .clear-search-btn {
    background: none;
    border: none;
    color: #e76b6b;
    font-size: 1.3em;
    cursor: pointer;
    margin-right: 0.3em;
    transition: color 0.18s;
  }
  .clear-search-btn:hover {
    color: #b82c2c;
  }

  .file-list {
    margin-top: 1.2em;
  }

  .file-item {
    display: flex;
    align-items: center;
    padding: 1em 1.2em;
    background: linear-gradient(90deg, #f7fafd 80%, #e3f6fc 100%);
    border: 1.5px solid #e0e4ec;
    border-radius: 14px;
    box-shadow: 0 2px 8px #6ec8f111;
    margin-bottom: 1em;
    transition: background 0.2s, box-shadow 0.2s;
    cursor: pointer;
    position: relative;
    gap: 1em;
  }

  .file-item:hover {
    background: linear-gradient(90deg, #e3f6fc 80%, #f7fafd 100%);
    box-shadow: 0 4px 16px #6ec8f122;
  }

  .file-icon {
    font-size: 2em;
    margin-left: 0.8em;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 2.2em;
  }
  .folder-gradient {
    background: linear-gradient(135deg, #6ec8f1 60%, #2e90c9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .file-gradient {
    background: linear-gradient(135deg, #f1b36e 60%, #c97c2e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .file-name {
    flex: 1;
    font-size: 1.08em;
    font-weight: 500;
    color: #2e90c9;
    word-break: break-all;
  }

  .file-name input {
    padding: 0.3em 0.6em;
    font-size: 1em;
    border: 1.5px solid #6ec8f1;
    border-radius: 8px;
    width: 100%;
    background: #f7fafd;
    color: #2e90c9;
    font-weight: 500;
    outline: none;
    box-shadow: 0 1px 4px #6ec8f111;
  }

  .file-actions {
    display: flex;
    gap: 0.7em;
    align-items: center;
  }

  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.3em;
    color: #6ec8f1;
    transition: color 0.18s, transform 0.18s;
    border-radius: 6px;
    padding: 0.2em 0.4em;
  }
  .action-btn:hover {
    color: #2e90c9;
    transform: scale(1.15);
    background: #e3f6fc;
  }
  .action-btn.delete {
    color: #e76b6b;
  }
  .action-btn.delete:hover {
    color: #b82c2c;
    background: #ffeaea;
  }

  .empty {
    color: #888;
    font-style: italic;
    text-align: center;
    padding: 2em 0;
    font-size: 1.1em;
    background: #f7fafd;
    border-radius: 12px;
    box-shadow: 0 1px 4px #6ec8f111;
  }

  @media (max-width: 900px) {
    .file-system {
      max-width: 98vw;
      margin: 1em 0.5em;
      padding: 1.2em 0.5em 1.5em 0.5em;
    }
  }
  @media (max-width: 768px) {
    .logo-top-right-wrapper {
      top: 10px;
      right: 10px;
    }
    .logo-top-right {
      max-width: 48px;
      max-height: 48px;
    }
    .controls {
      flex-direction: column;
      align-items: stretch;
      gap: 1em;
      padding: 0.7em 0.5em;
    }
    .file-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5em;
      padding: 0.8em 0.7em;
    }
    .file-actions {
      margin-top: 0.6em;
    }
    .breadcrumb {
      font-size: 0.98em;
      padding: 0.4em 0.6em;
    }
  }
`}</style>

      </div>
    </>
  );
 

}

export default FileSystem;
