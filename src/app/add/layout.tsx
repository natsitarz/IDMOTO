import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Add Vehicle",
  description: "Add a new car to your IDMOTO collection",
};

export default function AddLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
