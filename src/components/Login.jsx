// src/components/Login.jsx
import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

function EyeIcon({ off = false }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.8" />
      {off && (
        <path d="M4 20 L20 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

const MAX_ATTEMPTS = 5;

const Login = ({ onLoginSuccess = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <-- חדש
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      setError("אין חיבור אינטרנט. נסי שוב כשיהיה חיבור יציב.");
      return;
    }
    if (loading) return;

    setLoading(true);
    setError("");

    const userRef = doc(db, "users", email);

    try {
      // בדיקת נעילה וחסימה מוקדמת
      let locked = false;
      try {
        const preSnap = await getDoc(userRef);
        const preData = preSnap.exists() ? preSnap.data() : null;
        if (preData?.locked) locked = true;
        if (preData?.disabled) {
          setError("חוסר הרשאה: משתמש זה נמחק או נחסם מהמערכת.");
          setLoading(false);
          return;
        }
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

      // בדיקת הרשאה במסד לאחר התחברות מוצלחת
      const freshSnap = await getDoc(userRef);
      const freshData = freshSnap.exists() ? freshSnap.data() : null;
      if (!freshSnap.exists() || freshData?.disabled) {
        await signOut(auth);
        setError("חוסר הרשאה: משתמש זה נמחק או נחסם מהמערכת.");
        setLoading(false);
        return;
      }

      // איפוס מונה והסרת נעילה
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

      if (err.code === "auth/too-many-requests") {
        setError("בוצעו יותר מדי ניסיונות התחברות. ניתן לבצע איפוס סיסמה כעת.");
        setLoading(false);
        return;
      }

      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const current = snap.data()?.failedAttempts || 0;
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
      setError("אם החשבון קיים – נשלחה אליך הודעה לאיפוס סיסמה. אם לא מצאת, בדוק בתיקיית הספאם.");
    } catch (err) {
      console.error(err);
      setError(err.code === "auth/invalid-email" ? "כתובת אימייל לא תקינה." : "שגיאה בשליחת אימייל לאיפוס סיסמה.");
    }
  };

  return (
    <div className="login-page">
      <style>{`
  .login-page {
    min-height: calc(100vh - 160px);
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 8px 1rem 2rem;
  }

  @media (min-width: 520px) {
    .login-page { padding: 12px 2rem 2.5rem; }
  }

  .login-container {
    margin-top: 10px;
    background: #FBFAF8;
    border: 1px solid #EDE9E3;
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(18,32,58,.08);
    overflow: hidden;
    width: 100%;
    max-width: min(560px, 100%);
    text-align: right;
  }

  .login-strip { height: 5px; display: flex; }
  .login-strip span { flex: 1; }

  .login-inner { padding: clamp(28px, 6vw, 48px) clamp(24px, 6vw, 48px); }

  .login-title {
    margin: 0;
    font-family: "Heebo", var(--font-sans);
    font-weight: 900;
    font-size: clamp(1.7rem, 5vw, 2.1rem);
    line-height: 1.1;
    letter-spacing: -1px;
    color: #12203A;
  }

  .login-form { display: flex; flex-direction: column; gap: 1.1rem; text-align: right; margin-top: 28px; }
  .login-form label { font-size: .78rem; font-weight: 600; color: #8A8272; }

  .login-form input {
    width: 100%;
    padding: 0 1.15rem;
    border: 1.5px solid #EDE9E3;
    border-radius: 999px;
    background: #ffffff;
    font-size: 1rem;
    margin-top: .5rem;
    color: #12203A;
    outline: none;
    min-height: 52px;
    transition: border-color .15s ease, box-shadow .15s ease;
  }

  .login-form input::placeholder { color: #B8B2A6; }

  .login-form input:focus {
    border-color: #12203A;
    box-shadow: 0 0 0 4px rgba(18,32,58,.08);
  }

  .login-form input:-webkit-autofill,
  .login-form input:-webkit-autofill:hover,
  .login-form input:-webkit-autofill:focus {
    -webkit-text-fill-color: #12203A;
    caret-color: #12203A;
    background: #ffffff !important;
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
            box-shadow: 0 0 0 1000px #ffffff inset !important;
    transition: background-color 9999s ease-in-out 0s;
  }

  .login-form button[type="submit"] {
    background: #12203A;
    color: #fff;
    border: 0;
    padding: .85rem;
    border-radius: 999px;
    font-size: .95rem;
    font-weight: 700;
    cursor: pointer;
    min-height: 52px;
    margin-top: 4px;
    transition: background .2s, box-shadow .2s, transform .1s;
    -webkit-tap-highlight-color: transparent;
  }

  .login-form button[type="submit"]:hover {
    background: #1D3358;
    box-shadow: 0 8px 20px rgba(18,32,58,.25);
    transform: translateY(-1px);
  }

  .login-form button[type="submit"][disabled] {
    opacity: .6;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .login-footer {
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .login-footer button {
    background: none;
    border: 0;
    color: #6C6659;
    cursor: pointer;
    font-size: .8rem;
    font-weight: 600;
    border-bottom: 1px solid #D6D0C4;
    padding: 0 0 2px;
    min-height: 36px;
  }

  .login-footer button:hover { color: #12203A; border-color: #12203A; }

  .error-message {
    color: #C4534E;
    font-size: .85rem;
    margin-top: -.4rem;
    line-height: 1.4;
  }

  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-wrapper input {
    padding-left: 52px;
  }

  .toggle-password {
    position: absolute;
    left: 8px;
    background: #F4F2ED;
    border: 0;
    color: #12203A;
    cursor: pointer;
    padding: 0;
    width: 36px;
    height: 36px;
    min-height: 36px;
    min-width: 36px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, color 0.2s;
  }

  .toggle-password:hover { background: #EBE7DF; color: #12203A; }
`}</style>

      <div className="login-container">
        <div className="login-strip">
          <span style={{ background: "#E8467C" }} />
          <span style={{ background: "#35B6E8" }} />
          <span style={{ background: "#F5B93B" }} />
          <span style={{ background: "#F0862A" }} />
          <span style={{ background: "#7C5CD6" }} />
        </div>

        <div className="login-inner">
          <h2 className="login-title">
            התחברות
            <br />
            למערכת
          </h2>

          <form onSubmit={handleLogin} className="login-form">
            <label>
              אימייל
              <input
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              סיסמה
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? <EyeIcon off /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "מתחבר..." : "התחבר"}
            </button>
          </form>

          <div className="login-footer">
            <button onClick={handlePasswordReset}>שכחת סיסמה?</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
