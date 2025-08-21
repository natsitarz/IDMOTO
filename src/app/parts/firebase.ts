// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase - prevent duplicate initialization
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const analytics = app.name && typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth();

let appCheck: AppCheck | null = null;

const initAppCheck = () => {
  if (typeof window !== "undefined" && !appCheck) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(process.env.NEXT_PUBLIC_RECAPTCHA_KEY!),
        isTokenAutoRefreshEnabled: true
      });
    } catch (error) {
      console.warn("AppCheck initialization failed:", error);
    }
  }
};

// Initialize AppCheck only on client side
if (typeof window !== "undefined") {
  initAppCheck();
}
