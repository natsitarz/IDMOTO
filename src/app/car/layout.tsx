import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "IDMOTO | Car Details",
  description: "View detailed information about cars in the IDMOTO community",
};

export default function CarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
