import type { Metadata, Viewport } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Edit Profile | IDMOTO",
  description: "Update your profile settings and personal information",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function ProfileEditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
