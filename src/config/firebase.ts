import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Load Firebase service account key from environment variable or file
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

if (!serviceAccountKey) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set.');
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(path.resolve(serviceAccountKey)),
  // Add other configuration like databaseURL or storageBucket if needed
});

const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };