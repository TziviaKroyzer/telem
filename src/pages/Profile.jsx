// Profile.jsx

// src/pages/Profile.jsx
import React from "react";
import UserNameHeader from "../components/UserNameHeader";
import UserCommentsList from "../components/UserCommentsList";

export default function Profile() {
  return (
    <div>
      <UserNameHeader />
      <UserCommentsList />
    </div>
  );
}

/*
-----------------------------
כיצד להשתמש
1. וודאו שיש לכם קובץ firebase שמפעיל initializeApp (כל מקום ברמה עליונה של האפליקציה).
2. צרו את הקומפוננטה בעמוד המשתמש וייבאו:
   import UserCommentsWithFilter from './UserCommentsWithFilter';
   <UserCommentsWithFilter />

שדרוגים אפשריים (רצוי):
- להשתמש ב-onSnapshot במקום getDocs כדי לקבל עדכונים בזמן אמת.
- להוסיף טופס להוספת הערות חדשות (שישים את שדה user = currentUser.email ו־done=false).
- טיפול בעמודיות/מיון לפי תאריך.

אם את רוצה, איישם עכשיו אחד מהשדרוגים: onSnapshot (עדכונים חיים) או טופס הוספה — איזו אפשרות את מעדיפה להוסיף כצעד הבא?
*/

// import React, { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc,
// } from "firebase/firestore";

// function Profile() {
//   const [email, setEmail] = useState(null);
//   const [comments, setComments] = useState([]);

//   useEffect(() => {
//     const auth = getAuth();
//     const db = getFirestore();

//     // מאזין ל-auth כדי לקבל את המשתמש
//     const unsub = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setEmail(user.email);

//         // שליפת הערות מה-DB
//         const q = query(
//           collection(db, "comments"),
//           where("user", "==", user.email)
//         );
//         const snapshot = await getDocs(q);

//         const results = snapshot.docs.map((docSnap) => ({
//           id: docSnap.id,
//           ...docSnap.data(),
//         }));

//         setComments(results);
//       } else {
//         setEmail(null);
//         setComments([]);
//       }
//     });

//     return () => unsub();
//   }, []);

//   // פונקציה לעדכון סטטוס בוצע
//   const toggleDone = async (id, current) => {
//     const db = getFirestore();
//     const ref = doc(db, "comments", id);

//     await updateDoc(ref, { done: !current });

//     // נעדכן גם מקומית כדי שלא נצטרך לרענן
//     setComments((prev) =>
//       prev.map((c) => (c.id === id ? { ...c, done: !current } : c))
//     );
//   };

//   return (
//     <div className="comments-wrapper">
//       <h2>ההערות שלי</h2>
//       {comments.length === 0 ? (
//         <p>אין הערות להצגה</p>
//       ) : (
//         <ul className="comments-list">
//           {comments.map((c) => (
//             <li key={c.id} className={`comment-item ${c.done ? "done" : ""}`}>
//               <span>{c.noteText}</span>
//               <button onClick={() => toggleDone(c.id, c.done)}>
//                 {c.done ? "סמן כלא בוצע" : "סמן כבוצע"}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       <style>{`
//         .comments-wrapper { padding:20px; max-width:600px; margin:auto; }
//         .comments-list { list-style:none; padding:0; }
//         .comment-item { display:flex; justify-content:space-between; align-items:center;
//                         padding:10px; margin-bottom:8px; border:1px solid #ddd; border-radius:8px; }
//         .comment-item.done span { text-decoration:line-through; color:gray; }
//         button { padding:6px 12px; border:none; border-radius:6px; cursor:pointer; background:#4caf50; color:white; }
//         button:hover { background:#45a049; }
//       `}</style>
//     </div>
//   );
// }
// export default Profile;
// // export default function Profile({ fallbackName = "אורח/ת" }) {
// //   const [name, setName] = useState(fallbackName);

// //   useEffect(() => {
// //     const auth = getAuth();
// //     const db = getFirestore();

// //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
// //       if (user) {
// //         try {
// //           // טוענים את מסמך המשתמש לפי ה־UID
// //           const ref = doc(db, "users", user.email);
// //           const snap = await getDoc(ref);

// //           if (snap.exists()) {
// //             const data = snap.data();
// //             // נבנה שם מלא מ־firstName + lastName
// //             const fullName = `${data.firstName || ""} ${
// //               data.lastName || ""
// //             }`.trim();

// //             if (fullName) {
// //               setName(fullName);
// //             } else {
// //               setName(data.email || fallbackName);
// //             }
// //           } else {
// //             setName(user.email || fallbackName);
// //           }
// //         } catch (err) {
// //           console.error("שגיאה בשליפת שם משתמש מ־Firestore:", err);
// //           setName(user.email || fallbackName);
// //         }
// //       } else {
// //         setName(fallbackName);
// //       }
// //     });

// //     return () => unsubscribe();
// //   }, [fallbackName]);

// //   return (
// //     <div className="user-page-wrapper">
// //       <div className="user-card">
// //         <h2 className="user-title">פרטי משתמש</h2>
// //         <p className="user-name">
// //           שלום, <span className="user-name-strong">{name}</span>
// //         </p>
// //       </div>

// //       <style>{`
// //         .user-page-wrapper { display:flex; justify-content:center; padding:20px; }
// //         .user-card { border-radius:12px; padding:18px; width:100%; max-width:420px;
// //                      box-shadow:0 6px 18px rgba(0,0,0,0.08);
// //                      background:linear-gradient(180deg, #ffffff 0%, #fbfbff 100%); }
// //         .user-title { margin:0 0 12px 0; font-size:18px; }
// //         .user-name { margin:0; font-size:16px; }
// //         .user-name-strong { font-weight:700; }
// //       `}</style>
// //     </div>
// //   );
// // }
