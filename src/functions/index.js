const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUserByEmail = functions.https.onCall(async (data, context) => {
  const email = data.email;

  // בדיקת הרשאה בסיסית (אם יש צורך)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    return { success: true };
  } catch (error) {
    console.error('שגיאה במחיקת משתמש:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
