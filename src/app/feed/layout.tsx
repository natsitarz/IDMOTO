import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "IDMOTO | Feed",
  description: "Discover amazing cars from the IDMOTO community",
};

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
