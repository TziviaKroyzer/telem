import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const MAX_ATTEMPTS = 5;

const Login = ({ onLoginSuccess = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // מניעת קליקים כפולים

  const handleLogin = async (e) => {
    if (!navigator.onLine) {
      setError("אין חיבור אינטרנט. נסי שוב כשיהיה חיבור יציב.");
      return;
    }
    
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const userRef = doc(db, "users", email);

    try {
      // ננסה לבדוק אם החשבון נעול; אם אין הרשאות קריאה לפני התחברות - נתעלם
      let locked = false;
      try {
        const preSnap = await getDoc(userRef);
        if (preSnap.exists() && preSnap.data()?.locked) locked = true;
      } catch (_) {}
      if (locked) {
        setError(
          "החשבון נעול עקב 5 ניסיונות כושלים. יש לבצע איפוס סיסמה ולפנות למנהל לשחרור."
        );
        setLoading(false);
        return;
      }

      // ניסיון התחברות
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // בדיקת הרשאה קיימת במסד (users/{email})
      const freshSnap = await getDoc(userRef);
      if (!freshSnap.exists()) {
        // המשתמש קיים ב-Auth אבל לא מורשה במערכת => מוחקים ומודיעים
        try {
          await deleteUser(user);
        } catch (_) {}
        setError("הגישה שלך הוסרה מהמערכת. פנה למנהל.");
        setLoading(false);
        return;
      }

      // איפוס מונה והסרת נעילה (אם אין הרשאת כתיבה - נתעלם)
      try {
        await updateDoc(userRef, {
          failedAttempts: 0,
          locked: false,
          lastLogin: serverTimestamp(),
        });
      } catch (_) {}

      setLoading(false);
      onLoginSuccess();
    } catch (err) {
      console.error(err);

      // פיירבייס חסם זמנית בגלל יותר מדי ניסיונות
      if (err.code === "auth/too-many-requests") {
        setError(
          "בוצעו יותר מדי ניסיונות התחברות. ניתן לבצע איפוס סיסמה כעת."
        );
        setLoading(false);
        return;
      }

      // סיסמה שגויה – בגרסאות חדשות זה עלול להופיע כ-invalid-credential
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const current = snap.data()?.failedAttempts || 0;
            // אם פיירבייס כבר חוסם – לא נספור עוד ניסיון כאן
            const next = current + 1;
            const lock = next >= MAX_ATTEMPTS;

            try {
              await updateDoc(userRef, {
                failedAttempts: next,
                ...(lock ? { locked: true } : {}),
                lastFailedAt: serverTimestamp(),
              });
            } catch (_) {}

            setError(
              lock
                ? "נחסמת לאחר 5 ניסיונות כושלים. יש לבצע איפוס סיסמה ולפנות למנהל לשחרור."
                : `סיסמה שגויה. נותרו עוד ${MAX_ATTEMPTS - next} ניסיונות.`
            );
          } else {
            setError("סיסמה שגויה.");
          }
        } catch {
          setError("סיסמה שגויה.");
        }
        setLoading(false);
        return;
      }

      if (err.code === "auth/user-not-found") {
        setError("המשתמש לא קיים.");
        setLoading(false);
        return;
      }
      if (err.code === "auth/invalid-email") {
        setError("כתובת אימייל לא תקינה.");
        setLoading(false);
        return;
      }

      setError("שגיאה בהתחברות. בדוק את הפרטים שלך.");
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return setError("הכנס אימייל לאיפוס סיסמה.");

    try {
      await sendPasswordResetEmail(auth, email);
      setError("אם החשבון קיים – נשלחה אליך הודעה לאיפוס סיסמה.");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-email") {
        setError("כתובת אימייל לא תקינה.");
      } else {
        setError("שגיאה בשליחת אימייל לאיפוס סיסמה.");
      }
    }
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #f7fafd, #e6f3fa);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2em;
        }
        .login-container {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(110, 200, 241, 0.12);
          padding: 2.5em 2em;
          width: 100%;
          max-width: 420px;
          text-align: center;
        }
        .login-title {
          font-size: 1.6em;
          color: #6ec8f1;
          margin-bottom: 1em;
          font-weight: bold;
        }
        .login-form { display: flex; flex-direction: column; gap: 1em; }
        .login-form label { text-align: right; font-size: 0.95em; color: #7a7a7a; }
        .login-form input {
          width: 100%;
          padding: 0.65em 1em;
          border: 1px solid #e0e4ec;
          border-radius: 10px;
          background: #f9fbfd;
          font-size: 1em;
          margin-top: 0.3em;
        }
        .login-form input:focus { outline: none; border-color: #6ec8f1; }
        .login-form button[type="submit"] {
          background: #6ec8f1; color: white; border: none; padding: 0.7em;
          border-radius: 10px; font-size: 1em; cursor: pointer; transition: background 0.2s;
          opacity: ${"${"}loading ? 0.7 : 1${"}"}; pointer-events: ${"${"}loading ? "none" : "auto"${"}"};
        }
        .login-form button[type="submit"]:hover { background: #58bae4; }
        .login-footer { margin-top: 1em; }
        .login-footer button { background: none; border: none; color: #f4a63f; cursor: pointer; font-size: 0.9em; text-decoration: underline; }
        .error-message { color: #e76b6b; font-size: 0.85em; margin-top: -0.5em; text-align: center; }
      `}</style>

      <div className="login-container">
        <h2 className="login-title">התחברות למערכת</h2>
        <form onSubmit={handleLogin} className="login-form">
          <label>
            אימייל
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            סיסמה
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">
            {loading ? "מתחבר..." : "התחבר"}
          </button>
        </form>
        <div className="login-footer">
          <button onClick={handlePasswordReset}>שכחת סיסמה?</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
