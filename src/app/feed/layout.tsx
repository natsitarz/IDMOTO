import type { Metadata } from "next";
import "../globals.css";
import Navbar from "../parts/navbar";

export const metadata: Metadata = {
  title: `IDMOTO | Feed`,
  description: "Show the world your dream car",
};

export default function CarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1346635526682080"
          crossOrigin="anonymous"
        ></script>
      </head>
      <Navbar />
      {children}
    </>
  );
}
