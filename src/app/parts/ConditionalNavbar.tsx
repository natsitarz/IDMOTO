"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Navbar from "./navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const { loading: authInitializing } = useAuth();

  // Hide navbar on the main page (login page)
  if (pathname === "/") {
    return null;
  }

  // Show a minimal loading navbar while auth is initializing
  if (authInitializing) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-900/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-32 h-8 bg-white/5 rounded-xl animate-pulse" />
            <div className="hidden md:flex items-center gap-2">
              <div className="w-20 h-8 bg-white/5 rounded-xl animate-pulse" />
              <div className="w-20 h-8 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="w-24 h-8 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return <Navbar />;
}
