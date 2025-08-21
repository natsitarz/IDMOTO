import type { Metadata, Viewport } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Edit Car | IDMOTO",
  description: "Edit your car details, specifications, and settings on IDMOTO.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function CarEditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
