export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "IDMOTO",
    alternateName: "IDMOTO Car Social Network",
    url: "https://idmoto.vercel.app",
    description:
      "The ultimate car social network. Create your car profile, showcase your ride, and connect with automotive enthusiasts worldwide.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://idmoto.vercel.app/search?q={search_term_string}",
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
