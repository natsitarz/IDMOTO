import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { type MetadataRoute } from "next";

export const dynamic = "force-static";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Use the same robust initialization approach
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const carsSnap = await getDocs(collection(db, "vehicles"));
  const carUrls = carsSnap.docs.map((doc) => ({
    url: `https://idmoto.vercel.app/car?id=${doc.id}`,
    lastModified: new Date().toISOString(), // <-- string, nie Date
  }));

  const usersSnap = await getDocs(collection(db, "users"));
  const userUrls = usersSnap.docs.map((doc) => ({
    url: `https://idmoto.vercel.app/profile?uid=${doc.id}`,
    lastModified: new Date().toISOString(),
  }));

  const staticUrls = [
    {
      url: "https://idmoto.vercel.app/",
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://idmoto.vercel.app/feed",
      lastModified: new Date().toISOString(),
    },
    {
      url: "https://idmoto.vercel.app/profile",
      lastModified: new Date().toISOString(),
    },
  ];

  return [
    ...staticUrls,
    ...carUrls,
    ...userUrls,
  ];
}