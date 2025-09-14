// src/components/UserNameHeader.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function UserNameHeader({ fallbackName = "אורח/ת" }) {
  const [name, setName] = useState(fallbackName);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setName(fallbackName);
        return;
      }

      try {
        const userRef = doc(db, "users", user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const fullName = `${data.firstName || ""} ${
            data.lastName || ""
          }`.trim();
          setName(fullName || data.email || fallbackName);
        } else {
          setName(user.email || fallbackName);
        }
      } catch (err) {
        console.error("Error fetching user name:", err);
        setName(user.email || fallbackName);
      }
    });

    return () => unsubscribe();
  }, [fallbackName]);

  return (
    <div className="user-header">
      <h2>
        שלום, <span className="user-name">{name}</span>
      </h2>
    </div>
  );
}
