import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import type { Metadata, Viewport } from "next";
import React, { Suspense } from "react";
import CarPageInner from "../parts/CarPageInner";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Initialize Firebase for metadata generation (server-side safe)
const getFirebaseForMetadata = () => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app);
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  // Await searchParams as required by Next.js 15
  const resolvedSearchParams = await searchParams;
  const carId = resolvedSearchParams?.id;

  if (!carId || typeof carId !== "string") {
    return {
      title: "Car Details",
      description:
        "View detailed information about cars in the IDMOTO community",
    };
  }

  try {
    const db = getFirebaseForMetadata();
    const carRef = doc(db, "vehicles", carId);
    const carSnap = await getDoc(carRef);

    if (carSnap.exists()) {
      const carData = carSnap.data();
      const manufacturer = carData?.manufacturer || "Unknown";
      const model = carData?.model || "Model";
      const year = carData?.year || "";

      return {
        title: `${manufacturer} ${model}${year ? ` ${year}` : ""}`,
        description: `View details of this ${manufacturer} ${model} in the IDMOTO community. Check specifications, photos, and more.`,
      };
    }
  } catch (error) {
    console.error("Error fetching car data for metadata:", error);
  }

  return {
    title: "Car Details",
    description: "View detailed information about cars in the IDMOTO community",
  };
}

export default function CarPage() {
  return (
    <Suspense>
      <CarPageInner />
    </Suspense>
  );
}
