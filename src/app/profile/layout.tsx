import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "IDMOTO | Profile",
  description: "View and manage your IDMOTO profile and car collection",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
