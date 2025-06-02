import type { Metadata } from "next";
import "../globals.css";
import Navbar from "../parts/navbar";

export const metadata: Metadata = {
  title: "IDMOTO | Add vehicle",
  description: "Show the world your dream car",
};

export default function AddLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
