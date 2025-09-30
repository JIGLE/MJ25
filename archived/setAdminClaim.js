import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK (ensure you have your service account credentials setup)
// serviceAccount should point to your service account key JSON file
const serviceAccount = require('./serviceAccountKey.json'); // Assuming serviceAccountKey.json is in the same directory

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin claim for user ${uid}`);
    return { success: true };
  } catch (error) {
    console.error('Error setting custom admin claim:', error);
    return { success: false, error: error.message };
  }
}

// Replace 'user-uid-to-authorize' with the actual user UID you copied from Firebase Console
const userUidToAuthorize = 'lerurNo8BmOdtpfJjX0siyBNpIN2';

setAdminClaim(userUidToAuthorize)
  .then(result => {
    if (result.success) {
      console.log('Admin claim set successfully.');
    } else {
      console.error('Failed to set admin claim:', result.error);
    }
  });
