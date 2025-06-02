import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: `IDMOTO | Edit your car!`,
  description: "Show the world your dream car",
};

export default function CarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
