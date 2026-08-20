const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @param {unknown} value */
export function isFilled(value) {
  return String(value ?? "").trim().length > 0;
}

/**
 * בודק פורמט אימייל בסיסי.
 * @param {string} email
 */
export function isValidEmail(email) {
  return EMAIL_RE.test(String(email).trim());
}

/**
 * משאיר ספרות בלבד בשדה טלפון.
 * @param {string} value
 */
export function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

/**
 * טלפון ישראלי: 9–10 ספרות.
 * @param {string} phone
 */
export function isValidPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 10;
}

/**
 * סיסמת Firebase דורשת לפחות 6 תווים.
 * @param {string} password
 */
export function isValidPassword(password) {
  return String(password || "").length >= 6;
}

/**
 * מחזיר הודעת שגיאה לשדה, או מחרוזת ריקה אם תקין.
 * @param {"email"|"password"|"phone"|"required"} kind
 * @param {unknown} value
 * @param {string} [label]
 */
export function fieldError(kind, value, label = "שדה זה") {
  if (kind === "required" || !isFilled(value)) {
    if (!isFilled(value)) return `נא למלא ${label}`;
    if (kind === "required") return "";
  }
  if (kind === "email" && !isValidEmail(value)) return "כתובת האימייל אינה תקינה";
  if (kind === "password" && !isValidPassword(value)) return "הסיסמה חייבת להכיל לפחות 6 תווים";
  if (kind === "phone" && !isValidPhone(value)) return "טלפון: 9–10 ספרות בלבד";
  return "";
}
