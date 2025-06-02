import { Watermark } from "@/app/parts/watermark";
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "IDMOTO | About",
  description: "Show the world your dream car",
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Watermark />
    </>
  );
}
