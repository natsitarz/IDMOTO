import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about IDMOTO - the ultimate car community platform",
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
