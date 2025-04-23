// src/components/UsersList.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {db} from "../firebase";

const UsersList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          docid: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Users List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.docid} className="mb-2">
            <strong>ID:</strong> {user.docid} <strong>Name:</strong> {user.firstName} {user.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;