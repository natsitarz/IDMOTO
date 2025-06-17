import ClientErrorToaster from "@/app/parts/ClientErrorToaster";
import PageLoaderWrapper from "@/app/parts/PageLoaderWrapper";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IDMOTO",
  description: "Show off your ride!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-950 via-zinc-900 to-zinc-800`}
      >
        <PageLoaderWrapper />
        <ClientErrorToaster />
        {children}
      </body>
    </html>
  );
}
