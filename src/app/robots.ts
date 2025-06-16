import { type MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://idmoto.vercel.app/sitemap.xml", // replace with your real domain
    host: "https://idmoto.vercel.app", // optional, but recommended
  };
}