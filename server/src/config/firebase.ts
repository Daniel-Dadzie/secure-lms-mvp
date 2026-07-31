import { App, initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getMessaging } from "firebase-admin/messaging";

// ----------------------------------------------------------------------------
// Firebase Admin SDK initialization.
// Credentials come from environment variables — never from a committed file.
// The private key contains literal \n in the env var;
// replace with real newlines before passing to the SDK.
// ----------------------------------------------------------------------------
let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
} else {
  app = getApps()[0];
}

export const firebaseStorage = getStorage(app);
export const firebaseMessaging = getMessaging(app);