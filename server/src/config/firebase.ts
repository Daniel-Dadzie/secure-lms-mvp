import { App, initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getMessaging } from "firebase-admin/messaging";

// ----------------------------------------------------------------------------
// Firebase Admin SDK initialization.
// Credentials come from environment variables — never from a committed file.
// In test environments, fallback values are used to prevent CI crashes.
// ----------------------------------------------------------------------------
let app: App;

const isTest = process.env.NODE_ENV === "test";

const projectId =
  process.env.FIREBASE_PROJECT_ID || (isTest ? "test-project-id" : undefined);
const clientEmail =
  process.env.FIREBASE_CLIENT_EMAIL ||
  (isTest ? "test@example.com" : undefined);
const rawPrivateKey =
  process.env.FIREBASE_PRIVATE_KEY ||
  (isTest
    ? "TEST_PRIVATE_KEY_PLACEHOLDER_FOR_CI"
    : undefined);
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ||
  (isTest ? "test-bucket.appspot.com" : undefined);

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: rawPrivateKey?.replace(/\\n/g, "\n"),
    }),
    storageBucket,
  });
} else {
  app = getApps()[0];
}

export const firebaseStorage = getStorage(app);
export const firebaseMessaging = getMessaging(app);
