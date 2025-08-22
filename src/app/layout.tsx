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
    default: "IDMOTO – Show off your ride! | Car Social Network",
    template: "%s | IDMOTO",
  },
  description:
    "Join IDMOTO, the ultimate car social network. Create your car profile, showcase your ride, connect with automotive enthusiasts, and discover amazing vehicles from around the world. Share your automotive passion today!",
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
    "supercar",
    "classic cars",
    "modified cars",
    "car photography",
    "vehicle specs",
    "car database",
    "automotive social media",
    "car meets",
    "car culture",
  ],
  authors: [{ name: "IDMOTO Team", url: "https://idmoto.vercel.app" }],
  creator: "IDMOTO",
  publisher: "IDMOTO",
  applicationName: "IDMOTO",
  category: "Automotive Social Network",
  classification: "Automotive, Social Media, Community",
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
    title: "IDMOTO – Show off your ride! | Car Social Network",
    description:
      "Join IDMOTO, the ultimate car social network. Create your car profile, showcase your ride, and connect with automotive enthusiasts worldwide.",
    siteName: "IDMOTO",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "IDMOTO - The Ultimate Car Social Network Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@idmoto",
    creator: "@idmoto",
    title: "IDMOTO – Show off your ride! | Car Social Network",
    description:
      "Join IDMOTO, the ultimate car social network. Create your car profile, showcase your ride, and connect with automotive enthusiasts worldwide.",
    images: [
      {
        url: "/logo.png",
        alt: "IDMOTO - The Ultimate Car Social Network Platform",
      },
    ],
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
    yandex: process.env.YANDEX_VERIFICATION_ID,
    other: {
      "msvalidate.01": process.env.BING_VERIFICATION_ID || "",
    },
  },
  alternates: {
    canonical: "https://idmoto.vercel.app",
    languages: {
      "en-US": "https://idmoto.vercel.app",
    },
  },
  other: {
    "theme-color": "#18181b",
    "color-scheme": "dark",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "IDMOTO",
    "application-name": "IDMOTO",
    "msapplication-TileColor": "#18181b",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="IDMOTO" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#18181b" />
        <meta name="msapplication-TileColor" content="#18181b" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="google-adsense-account" content="ca-pub-1346635526682080" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1346635526682080"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "IDMOTO",
              alternateName: "IDMOTO Car Social Network",
              url: "https://idmoto.vercel.app",
              description:
                "The ultimate car social network. Create your car profile, showcase your ride, and connect with automotive enthusiasts worldwide.",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://idmoto.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              sameAs: [
                "https://twitter.com/idmoto",
                "https://facebook.com/idmoto",
                "https://instagram.com/idmoto",
              ],
              publisher: {
                "@type": "Organization",
                name: "IDMOTO",
                url: "https://idmoto.vercel.app",
                logo: {
                  "@type": "ImageObject",
                  url: "https://idmoto.vercel.app/logo.png",
                },
              },
            }),
          }}
        />
      </head>
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
