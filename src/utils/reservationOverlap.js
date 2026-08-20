/**
 * האם שני טווחי שעות חופפים.
 * שעת הסיום לא נחשבת תפוסה: 10:00–12:00 ו־12:00–14:00 לא חופפים.
 * @param {string} startA
 * @param {string} endA
 * @param {string} startB
 * @param {string} endB
 */
export function timesOverlap(startA, endA, startB, endB) {
  return Boolean(startA && endA && startB && endB && startA < endB && startB < endA);
}

/**
 * מחזיר את השריון הקיים שחופף לטווח המבוקש, או null.
 * @param {{startTime?: string, endTime?: string, description?: string}[]} existing
 * @param {string} startTime
 * @param {string} endTime
 */
export function findOverlappingReservation(existing, startTime, endTime) {
  return (
    (existing || []).find((r) =>
      timesOverlap(startTime, endTime, r.startTime, r.endTime)
    ) || null
  );
}

/**
 * הודעה כשהאולם כבר תפוס בשעות שנבחרו.
 * @param {{startTime?: string, endTime?: string, description?: string}} conflict
 */
export function overlapMessage(conflict) {
  const slot = `${conflict.startTime}–${conflict.endTime}`;
  const desc = conflict.description && conflict.description !== "אין" ? ` · ${conflict.description}` : "";
  return `האולם כבר תפוס בשעות האלה (${slot}${desc}). בחרו שעות אחרות.`;
}
