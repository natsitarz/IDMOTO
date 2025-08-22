import { getApp, getApps, initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
} from "firebase/storage";
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
  return { db: getFirestore(app), storage: getStorage(app) };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  // Await searchParams as required by Next.js 15
  const resolvedSearchParams = await searchParams;
  const carId = resolvedSearchParams?.id;

  // Default metadata for invalid/missing car ID
  const defaultMetadata: Metadata = {
    title: "Car Details | IDMOTO",
    description:
      "View detailed information about cars in the IDMOTO community - the ultimate automotive social network.",
    openGraph: {
      title: "Car Details | IDMOTO",
      description:
        "View detailed information about cars in the IDMOTO community - the ultimate automotive social network.",
      type: "website",
      siteName: "IDMOTO",
      images: [
        {
          url: "/background-car-placeholder.png",
          width: 1200,
          height: 630,
          alt: "IDMOTO - Discover amazing vehicles",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Car Details | IDMOTO",
      description:
        "View detailed information about cars in the IDMOTO community - the ultimate automotive social network.",
      images: ["/background-car-placeholder.png"],
    },
  };

  if (!carId || typeof carId !== "string") {
    return defaultMetadata;
  }

  try {
    const { db, storage } = getFirebaseForMetadata();
    const carRef = doc(db, "vehicles", carId);
    const carSnap = await getDoc(carRef);

    if (carSnap.exists()) {
      const carData = carSnap.data();
      const manufacturer = carData?.manufacturer || "Unknown";
      const model = carData?.model || "Model";
      const year = carData?.year || "";
      const engine = carData?.engine || "";
      const horsepower = carData?.horsepower || "";
      const description = carData?.description || "";

      // Try to get the car's background image
      let carImageUrl = "/background-car-placeholder.png";
      try {
        const imageRef = storageRef(storage, `vehicles/${carId}/backgroundPic`);
        carImageUrl = await getDownloadURL(imageRef);
      } catch {
        // Use placeholder if car image not found
        console.log("Car background image not found, using placeholder");
      }

      // Create comprehensive title and description
      const carTitle = `${manufacturer} ${model}${year ? ` ${year}` : ""}`;
      const yearText = year ? ` from ${year}` : "";
      const engineText = engine ? ` with ${engine}` : "";
      const hpText = horsepower ? ` (${horsepower}HP)` : "";
      const descText = description ? ` ${description}` : "";

      const carDescription = `Discover this stunning ${manufacturer} ${model}${yearText}${engineText}${hpText} on IDMOTO.${descText} Join the ultimate automotive social network to explore amazing vehicles, connect with car enthusiasts, and showcase your own ride!`;

      const carUrl = `https://idmoto.vercel.app/car?id=${carId}`;

      return {
        title: carTitle,
        description: carDescription,
        alternates: {
          canonical: carUrl,
        },
        openGraph: {
          title: carTitle + " | IDMOTO",
          description: carDescription,
          type: "article",
          url: carUrl,
          siteName: "IDMOTO",
          images: [
            {
              url: carImageUrl,
              width: 1200,
              height: 630,
              alt: `${manufacturer} ${model}${year ? ` ${year}` : ""} - IDMOTO`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: carTitle,
          description: carDescription,
          images: [
            {
              url: carImageUrl,
              alt: `${manufacturer} ${model}${year ? ` ${year}` : ""} - IDMOTO`,
            },
          ],
        },
        keywords: [
          manufacturer,
          model,
          `${manufacturer} ${model}`,
          year ? year.toString() : "",
          "car profile",
          "vehicle showcase",
          "automotive",
          "car community",
          "IDMOTO",
          "car social network",
          engine || "",
          horsepower ? `${horsepower}HP` : "",
        ].filter(Boolean),
        other: {
          "article:author": "IDMOTO Community",
          "article:section": "Automotive",
          "article:tag": `${manufacturer}, ${model}, automotive, car showcase`,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching car data for metadata:", error);
  }

  return defaultMetadata;
}

export default function CarPage() {
  return (
    <Suspense>
      <CarPageInner />
    </Suspense>
  );
}
