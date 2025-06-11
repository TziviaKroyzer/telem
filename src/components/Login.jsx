import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // שלב 1: התחברות ל-Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // שלב 2: בדיקה אם המשתמש קיים במסד הנתונים (Firestore)
      const userDoc = await getDoc(doc(db, "users", email));

      if (!userDoc.exists()) {
        // המשתמש התחבר ל-Auth אבל לא קיים ב-DB → מוחק את עצמו
        await deleteUser(user);
        setError("הגישה שלך הוסרה מהמערכת. פנה למנהל.");
        return;
      }

      // שלב 3: המשתמש קיים גם ב-Auth וגם ב-DB
      onLoginSuccess();
      console.log("Signed in:", user);

    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setError("המשתמש לא קיים.");
      } else if (err.code === "auth/wrong-password") {
        setError("סיסמה שגויה.");
      } else if (err.code === "auth/invalid-email") {
        setError("כתובת אימייל לא תקינה.");
      } else {
        setError("שגיאה בהתחברות. בדוק את הפרטים שלך.");
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return setError("הכנס אימייל לאיפוס סיסמה.");

    try {
      const userDoc = await getDoc(doc(db, "users", email));

      if (!userDoc.exists()) {
        setError("המשתמש לא קיים במערכת. פנה למנהל.");
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setError("אימייל לאיפוס סיסמה נשלח.");
    } catch (err) {
      console.error(err);
      setError("שגיאה בשליחת אימייל לאיפוס סיסמה.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-2xl bg-white relative">
      <h2 className="text-2xl font-bold mb-4 text-center">התחברות למערכת</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          התחבר
        </button>
      </form>

      <div className="mt-4 text-sm text-center">
        <button onClick={handlePasswordReset} className="text-blue-500 hover:underline">
          שכחת סיסמה?
        </button>
      </div>
    </div>
  );
};

export default Login;
