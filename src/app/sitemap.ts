import { getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { type MetadataRoute } from "next";

// --- KONFIGURACJA FIREBASE (wstaw swoje dane) ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...inne dane jeśli potrzebujesz
};

if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pobierz wszystkie auta z kolekcji "vehicles"
  const carsSnap = await getDocs(collection(db, "vehicles"));
  const carUrls = carsSnap.docs.map((doc) => ({
    url: `https://idmoto.vercel.app/car?id=${doc.id}`,
    lastModified: new Date(),
  }));

  const usersSnap = await getDocs(collection(db, "users"));
  const userUrls = usersSnap.docs.map((doc) => ({
    url: `https://idmoto.vercel.app/profile?uid=${doc.id}`,
    lastModified: new Date(),
  }));

  // Statyczne strony
  const staticUrls = [
    {
      url: "https://idmoto.vercel.app/",
      lastModified: new Date(),
    },
    {
      url: "https://idmoto.vercel.app/feed",
      lastModified: new Date(),
    },
    {
      url: "https://idmoto.vercel.app/profile",
      lastModified: new Date(),
    },
  ];

  return [
    ...staticUrls,
    ...carUrls,
  ];
}