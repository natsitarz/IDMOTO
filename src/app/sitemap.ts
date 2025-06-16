import { type MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://idmoto.vercel.app/",
      lastModified: new Date(),
    },
    {
      url: "https://idmoto.vercel.app/feed",
      lastModified: new Date(),
    },
    {
      url: "https://idmoto.vercel.app/profile",
      lastModified: new Date(),
    },
    // Add more static or dynamic URLs as needed
  ];
}