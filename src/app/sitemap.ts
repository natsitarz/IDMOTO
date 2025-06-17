import { getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { type MetadataRoute } from "next";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

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