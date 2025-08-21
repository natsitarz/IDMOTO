import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your profile settings and personal information",
};

export default function ProfileEditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
