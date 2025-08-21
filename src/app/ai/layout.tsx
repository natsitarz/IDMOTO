import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "IDMOTO | AI Assistant",
  description: "Get AI-powered help and insights for your automotive needs",
};

export default function AILayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
