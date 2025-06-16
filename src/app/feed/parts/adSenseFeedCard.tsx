import React, { useEffect } from "react";

export default function AdSenseFeedCard() {
  useEffect(() => {
    // @ts-ignore
    if (window.adsbygoogle) window.adsbygoogle.push({});
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900/80 rounded-2xl shadow border border-zinc-800 mb-4 sm:mb-6 px-2 py-3 sm:px-4 sm:py-4 flex justify-center items-center min-h-[120px]">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXX" // <-- your AdSense client ID
        data-ad-slot="XXXXXXXXXX" // <-- your AdSense slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
