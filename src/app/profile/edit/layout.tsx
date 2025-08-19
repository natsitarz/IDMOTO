import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Profile",
  description: "Show the world your dream car",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
