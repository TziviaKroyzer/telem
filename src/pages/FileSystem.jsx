// FileSystem.jsx – מערכת ניהול קבצים עם חיפוש מתקדם

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

  const deleteItem = async (itemId) => {
    if (!window.confirm("האם להסיר את הפריט?")) return;
    const itemRef = doc(db, "files", itemId);
    const snap = await getDoc(itemRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.type === "file" && data.url) {
        const fileName = data.url.split('/').pop().split('?')[0];
        const fileRef = ref(storage, `files/${user.uid}/${fileName}`);
        await deleteObject(fileRef).catch(() => {});
      }
    }
    await deleteDoc(itemRef);
    fetchItems();
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
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="🔍 חיפוש קבצים ותיקיות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="clear-search-btn" title="נקה חיפוש">
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="action-buttons">
          <button onClick={uploadFile} className="btn upload-btn">📄 הוסף קובץ</button>
          <button onClick={createFolder} className="btn folder-btn">📁 הוסף תיקיה</button>
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
                {item.type === "folder" ? "📁" : "📄"}
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
                    onClick={(e) => e.stopPropagation()}
                  />
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
                  ✏️
                </button>
                {item.type === "file" && (
                  <button
                    onClick={(e) => downloadFile(item, e)}
                    className="action-btn download"
                    title="הורד קובץ"
                  >
                    ⬇️
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                  className="action-btn delete"
                  title="מחק"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

     
    </div>
  );
}

export default FileSystem;