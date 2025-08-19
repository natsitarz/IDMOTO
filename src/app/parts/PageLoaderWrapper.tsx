"use client";
import PageLoader from "@/app/parts/PageLoader";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageLoaderWrapper() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true); // Always true at first

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 0); // Adjust duration as needed
    return () => clearTimeout(timeout);
  }, [pathname]);

  return <PageLoader loading={loading} />;
}
