import { doc, getDoc } from "firebase/firestore";
import type { Metadata, Viewport } from "next";
import React, { Suspense } from "react";
import CarPageInner from "../parts/CarPageInner";
import { db } from "../parts/firebase";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  // Await searchParams as required by Next.js 15
  const resolvedSearchParams = await searchParams;
  const carId = resolvedSearchParams?.id;

  if (!carId || typeof carId !== "string") {
    return {
      title: "Car Details | IDMOTO",
      description:
        "View detailed information about cars in the IDMOTO community",
    };
  }

  try {
    const carRef = doc(db, "vehicles", carId);
    const carSnap = await getDoc(carRef);

    if (carSnap.exists()) {
      const carData = carSnap.data();
      const manufacturer = carData?.manufacturer || "Unknown";
      const model = carData?.model || "Model";
      const year = carData?.year || "";

      return {
        title: `${manufacturer} ${model}${year ? ` ${year}` : ""} | IDMOTO`,
        description: `View details of this ${manufacturer} ${model} in the IDMOTO community. Check specifications, photos, and more.`,
      };
    }
  } catch (error) {
    console.error("Error fetching car data for metadata:", error);
  }

  return {
    title: "Car Details | IDMOTO",
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
