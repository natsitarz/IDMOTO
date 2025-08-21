import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Edit Car",
  description: "Update and manage your car profile details",
};

export default function CarEditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
