// src/components/Login.jsx
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
      // בדיקת נעילה מוקדמת (אם יש הרשאת קריאה לפני התחברות)
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

      // בדיקת הרשאה במסד (users/{email})
      const freshSnap = await getDoc(userRef);
      if (!freshSnap.exists()) {
        try {
          await deleteUser(user);
        } catch (_) {}
        setError("הגישה שלך הוסרה מהמערכת. פנה למנהל.");
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
      setError("אם החשבון קיים – נשלחה אליך הודעה לאיפוס סיסמה.");
    } catch (err) {
      console.error(err);
      setError(err.code === "auth/invalid-email" ? "כתובת אימייל לא תקינה." : "שגיאה בשליחת אימייל לאיפוס סיסמה.");
    }
  };

  return (
    <div className="login-page">
      <style>{`
  .login-page{
    /* היה center -> עכשיו למעלה כדי לצמצם רווח מתחת ללוגו/ההדר */
    min-height: 100vh;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;   /* חשוב */
    padding: 1rem 2rem;            /* פחות רווח אנכי */
  }

  .login-container{
    /* טופס קרוב יותר ללוגו */
    margin-top: 8px;               /* אם תרצי צמוד ממש: 0 */
    background: transparent;
    border: 0;
    box-shadow: none;
    width: 100%;
    max-width: 440px;
    text-align: center;
    padding: 0;
  }

  .login-title{ font-size:1.6rem; color:#6ec8f1; margin:0 0 0.75rem; font-weight:700; }

  .login-form{ display:flex; flex-direction:column; gap:1rem; text-align:right; }
  .login-form label{ font-size:.95rem; color:#637186; }

  /* שדות לבנים תמיד (כולל Autofill) */
  .login-form input{
    width:100%;
    padding:.65rem 1rem;
    border:1px solid #e0e4ec;
    border-radius:10px;
    background:#ffffff;
    font-size:1rem;
    margin-top:.35rem;
    color:#0f172a;
    outline:none;
    transition:border-color .15s ease, box-shadow .15s ease, background-color .15s;
  }
  .login-form input::placeholder{ color:#9aa7b5; }
  .login-form input:focus{
    border-color:#6ec8f1;
    box-shadow:0 0 0 3px rgba(110,200,241,.25);
    background:#ffffff;
  }
  .login-form input:-webkit-autofill,
  .login-form input:-webkit-autofill:hover,
  .login-form input:-webkit-autofill:focus{
    -webkit-text-fill-color:#0f172a;
    caret-color:#0f172a;
    background:#ffffff !important;
    -webkit-box-shadow:0 0 0 1000px #ffffff inset !important;
            box-shadow:0 0 0 1000px #ffffff inset !important;
    transition: background-color 9999s ease-in-out 0s;
  }

  .login-form button[type="submit"]{
    background:#6ec8f1; color:#fff; border:0; padding:.8rem;
    border-radius:12px; font-size:1rem; font-weight:600; cursor:pointer;
    transition:background .2s, box-shadow .2s, transform .1s;
    box-shadow:0 2px 10px rgba(110,200,241,.18);
  }
  .login-form button[type="submit"]:hover{
    background:#58bae4; box-shadow:0 6px 18px rgba(110,200,241,.24); transform:translateY(-1px);
  }
  .login-form button[type="submit"][disabled]{ opacity:.6; cursor:not-allowed; box-shadow:none; transform:none; }

  .login-footer{ margin-top:1rem; }
  .login-footer button{
    background:none; border:0; color:#f4a63f; cursor:pointer; font-size:.95rem; text-decoration:underline;
  }

  .error-message{ color:#e76b6b; font-size:.9rem; margin-top:-.25rem; text-align:center; }
  .password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;        /* בלי רקע */
  border: none;            /* בלי מסגרת */
  color: #6ec8f1;          /* צבע כחול תואם לעיצוב שלך */
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #58bae4;          /* טיפה כהה יותר כשעוברים עם העכבר */
  text-decoration: underline;
}

`}</style>

      <div className="login-container">
        <h2 className="login-title">התחברות למערכת</h2>

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
      type={showPassword ? "text" : "password"}   // ← כאן ההבדל
      dir="ltr"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button
      type="button"
      className="toggle-password"
      onClick={() => setShowPassword(!showPassword)} // ← הופך בין הצגה/הסתרה
    >
      {showPassword ? "הסתר" : "הצג"}
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
  );
};

export default Login;
