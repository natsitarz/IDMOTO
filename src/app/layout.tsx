import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./parts/AuthProvider";
import ClientErrorToaster from "./parts/ClientErrorToaster";
import ConditionalNavbar from "./parts/ConditionalNavbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://idmoto.vercel.app"),
  title: {
    default: "IDMOTO – Show off your ride!",
    template: "%s | IDMOTO",
  },
  description:
    "Create and share your car profile with IDMOTO. Join the ultimate car community and showcase your automotive passion.",
  keywords: [
    "car profile",
    "car social network",
    "vehicle history",
    "automotive",
    "car community",
    "car enthusiasts",
    "car management",
    "car sharing",
    "vehicle profile",
    "car lovers",
    "automotive enthusiasts",
    "car showcase",
    "car collection",
  ],
  authors: [{ name: "IDMOTO Team" }],
  creator: "IDMOTO",
  publisher: "IDMOTO",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://idmoto.vercel.app",
    title: "IDMOTO – Show off your ride!",
    description:
      "Create and share your car profile with IDMOTO. Join the ultimate car community.",
    siteName: "IDMOTO",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "IDMOTO - Car Social Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IDMOTO – Show off your ride!",
    description:
      "Create and share your car profile with IDMOTO. Join the ultimate car community.",
    images: ["/logo.png"],
    creator: "@idmoto",
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
  alternates: {
    canonical: "https://idmoto.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} antialiased bg-zinc-900 text-white min-h-screen`}
      >
        <AuthProvider>
          <ClientErrorToaster />
          <ConditionalNavbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
