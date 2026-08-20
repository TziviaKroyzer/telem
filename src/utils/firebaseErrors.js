/**
 * מחזיר הודעת שגיאה בעברית לקוד שגיאה של Firebase Auth.
 * @param {string|{code?: string}} error קוד שגיאה או אובייקט Error מ-Firebase
 * @returns {string} הודעה ידידותית למשתמש
 */
export function getFirebaseErrorMessage(error) {
  const code = typeof error === "string" ? error : error?.code || "";

  const messages = {
    "auth/weak-password": "הסיסמה חייבת להכיל לפחות 6 תווים",
    "auth/email-already-in-use": "כתובת האימייל כבר רשומה במערכת",
    "auth/invalid-email": "כתובת האימייל אינה תקינה",
    "auth/user-not-found": "אימייל או סיסמה שגויים",
    "auth/wrong-password": "אימייל או סיסמה שגויים",
    "auth/invalid-credential": "אימייל או סיסמה שגויים",
    "auth/network-request-failed": "בעיית חיבור לרשת, נסה שוב",
    "auth/too-many-requests": "בוצעו יותר מדי ניסיונות. ניתן לאפס סיסמה או לנסות מאוחר יותר",
    "auth/user-disabled": "החשבון הזה הושבת",
    "auth/missing-password": "יש למלא סיסמה",
    "auth/missing-email": "יש למלא כתובת אימייל",
  };

  return messages[code] || "אירעה שגיאה. נסי שוב.";
}
