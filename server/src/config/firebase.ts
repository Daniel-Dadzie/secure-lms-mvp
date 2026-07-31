import * as admin from "firebase-admin";

// ----------------------------------------------------------------------------
// Firebase Admin SDK initialization.
// Credentials come from environment variables — never from a committed file.
// The private key contains literal \n characters in the env var;
// we replace them with real newlines before passing to the SDK.
// ----------------------------------------------------------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const firebaseAdmin = admin;
export const firebaseStorage = admin.storage();
export const firebaseMessaging = admin.messaging();