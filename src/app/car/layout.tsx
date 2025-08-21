import { doc, getDoc } from "firebase/firestore";
import type { Metadata } from "next";
import "../globals.css";
import { db } from "../parts/firebase";

type Props = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  // Safely access the id parameter
  const carId = searchParams?.id;

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

export default function CarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
