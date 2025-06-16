import ClientErrorToaster from "@/app/parts/ClientErrorToaster";
import PageLoaderWrapper from "@/app/parts/PageLoaderWrapper";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
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
      <Head>
        <meta
          name="keywords"
          content="car profile, car social network, vehicle history, automotive, car community, your car profile, car enthusiasts, car management, car sharing, vehicle profile, car lovers, automotive enthusiasts, car showcase, car collection"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="IDMOTO – Show off your ride!" />
        <meta
          property="og:description"
          content="Create and share your car profile with IDMOTO."
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1346635526682080"
          crossOrigin="anonymous"
        ></script>
      </Head>
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
