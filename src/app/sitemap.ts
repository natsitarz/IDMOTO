import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
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
  const baseUrl = "https://idmoto.vercel.app";
  const currentDate = new Date().toISOString();

  const staticUrls = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: currentDate,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/add`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  try {
    // Only fetch public vehicles for sitemap (respects security rules)
    const publicCarsQuery = query(
      collection(db, "vehicles"),
      where("visibility", "==", "public")
    );
    const carsSnap = await getDocs(publicCarsQuery);
    const carUrls = carsSnap.docs.map((doc) => ({
      url: `${baseUrl}/car?id=${doc.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Fetch all users (user profiles are generally public)
    const usersSnap = await getDocs(collection(db, "users"));
    const userUrls = usersSnap.docs.map((doc) => ({
      url: `${baseUrl}/profile?uid=${doc.id}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [
      ...staticUrls,
      ...carUrls,
      ...userUrls,
    ];
  } catch (error) {
    console.warn("Failed to fetch dynamic content for sitemap:", error);
    // Return static URLs only if Firebase fetch fails
    return staticUrls;
  }
}