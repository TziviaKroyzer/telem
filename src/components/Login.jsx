import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import logo from "../assets/logo.webp"; // ודא שהנתיב נכון

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", email));

      if (!userDoc.exists()) {
        await deleteUser(user);
        setError("הגישה שלך הוסרה מהמערכת. פנה למנהל.");
        return;
      }

      onLoginSuccess();
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

        .login-logo {
          max-width: 120px;
          margin: 0 auto 1.2em;
          display: block;
        }

        .login-title {
          font-size: 1.6em;
          color: #6ec8f1;
          margin-bottom: 1em;
          font-weight: bold;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1em;
        }

        .login-form label {
          text-align: right;
          font-size: 0.95em;
          color: #7a7a7a;
        }

        .login-form input {
          width: 100%;
          padding: 0.65em 1em;
          border: 1px solid #e0e4ec;
          border-radius: 10px;
          background: #f9fbfd;
          font-size: 1em;
          margin-top: 0.3em;
        }

        .login-form input:focus {
          outline: none;
          border-color: #6ec8f1;
        }

        .login-form button[type="submit"] {
          background: #6ec8f1;
          color: white;
          border: none;
          padding: 0.7em;
          border-radius: 10px;
          font-size: 1em;
          cursor: pointer;
          transition: background 0.2s;
        }

        .login-form button[type="submit"]:hover {
          background: #58bae4;
        }

        .login-footer {
          margin-top: 1em;
        }

        .login-footer button {
          background: none;
          border: none;
          color: #f4a63f;
          cursor: pointer;
          font-size: 0.9em;
          text-decoration: underline;
        }

        .error-message {
          color: #e76b6b;
          font-size: 0.85em;
          margin-top: -0.5em;
          text-align: center;
        }
      `}</style>

      <div className="login-container">
        <img src={logo} alt="לוגו" className="login-logo" />
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
          <button type="submit">התחבר</button>
        </form>
        <div className="login-footer">
          <button onClick={handlePasswordReset}>שכחת סיסמה?</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
