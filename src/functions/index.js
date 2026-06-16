const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteUserByEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.email) {
    throw new functions.https.HttpsError('permission-denied', 'נדרש אימות עם כתובת אימייל תקינה');
  }

  const { email } = data;
  const callerEmail = context.auth.token.email;

  try {
    const callerDoc = await admin.firestore().collection('users').doc(callerEmail).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'נדרשת הרשאת מנהל');
    }

    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().deleteUser(user.uid);
    return { success: true };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) throw error;
    console.error('שגיאה במחיקת משתמש:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
