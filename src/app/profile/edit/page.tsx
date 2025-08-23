"use client";

import { useAuth } from "@/app/parts/AuthProvider";
import LoadingScreen from "@/app/parts/LoadingScreen";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EditProfileAvatar from "./parts/EditProfileAvatar";
import EditProfileMain from "./parts/EditProfileMain";
import EditProfileSecurity from "./parts/EditProfileSecurity";
import EditProfileSocials from "./parts/EditProfileSocials";

const PROFILE_MENU = [
  { key: "main", label: "Profile" },
  { key: "avatar", label: "Avatar" },
  { key: "socials", label: "Socials" },
  { key: "security", label: "Security" },
];

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState("main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle menu selection with smooth transition
  const handleMenuSelect = (key: string) => {
    if (key === selected) return;

    setIsTransitioning(true);

    // Small delay to show transition effect
    setTimeout(() => {
      setSelected(key);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 150);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Show loading while auth is being checked
  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100dvh-67px)] flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 bg-fixed font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-3xl bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 shadow-2xl border border-zinc-800/60 backdrop-blur-lg p-0 flex flex-col md:flex-row items-stretch gap-0 animate-fade-in-scale relative overflow-hidden min-h-[calc(100dvh-67px)]">
        <button
          onClick={() => router.back()}
          className="cursor-pointer absolute top-4 right-4 z-20 p-2 text-zinc-300 hover:text-white transition-all duration-200 group"
          aria-label="Go back"
        >
          <svg
            className="w-5 h-5 transform group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {/* Dekoracyjny blur-circle */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none z-0" />
        {/* MOBILE MENU */}
        <div className="md:hidden w-full border-b border-zinc-800/60 bg-zinc-900/80 z-30 relative">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-white font-semibold text-base focus:outline-none cursor-pointer"
            onClick={() => setMobileMenuOpen((v) => !v)}
            type="button"
          >
            {PROFILE_MENU.find((m) => m.key === selected)?.label}
            <svg
              className={`ml-2 w-5 h-5 transition-transform ${
                mobileMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center"
              style={{ pointerEvents: "auto" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40"
                aria-hidden="true"
              />
              {/* Dropdown */}
              <div
                className="relative w-full mx-auto bg-zinc-900/95 border border-zinc-800/60 shadow-xl flex flex-col overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {PROFILE_MENU.map((item) => (
                  <button
                    key={item.key}
                    className={`w-full text-left px-4 py-3 font-semibold transition cursor-pointer
                      ${
                        selected === item.key
                          ? "bg-blue-600/80 text-white"
                          : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                      }`}
                    onClick={() => {
                      handleMenuSelect(item.key);
                      setMobileMenuOpen(false);
                    }}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP MENU */}
        <aside className="hidden md:flex flex-col gap-2 bg-zinc-900/80 border-r border-zinc-800/60 min-w-[160px] max-w-[180px] py-10 px-4 z-10">
          <h2 className="text-xs uppercase text-zinc-400 font-bold mb-2 tracking-widest pl-1">
            Profile Menu
          </h2>
          {PROFILE_MENU.map((item) => (
            <button
              key={item.key}
              className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-all text-sm cursor-pointer
                ${
                  selected === item.key
                    ? "bg-blue-600/80 text-white shadow"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                }`}
              style={{ minWidth: 0 }}
              onClick={() => handleMenuSelect(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 w-full relative">
          {isTransitioning ? (
            // Transition loading state that matches the content structure
            <div className="w-full max-w-md space-y-6 animate-fade-in-scale">
              {/* Title skeleton */}
              <div className="text-center space-y-2">
                <div className="h-8 w-48 bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-lg animate-pulse mx-auto" />
                <div className="h-4 w-64 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse mx-auto" />
              </div>

              {/* Content skeleton - adaptive to menu type */}
              {selected === "main" ? (
                <div className="space-y-6">
                  {/* Avatar skeleton */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 bg-gradient-to-br from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-full animate-pulse" />
                    <div className="h-4 w-32 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded-lg animate-pulse" />
                  </div>

                  {/* Form fields skeleton */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                      <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                      <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                      <div className="h-24 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                    </div>
                    <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                  </div>
                </div>
              ) : selected === "avatar" ? (
                <div className="space-y-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-full animate-pulse mx-auto" />
                  <div className="space-y-4">
                    <div className="h-12 w-full bg-gradient-to-r from-blue-800/40 via-blue-700/60 to-blue-800/40 rounded-xl animate-pulse" />
                    <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                  </div>
                </div>
              ) : selected === "socials" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                    <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                    <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                </div>
              ) : (
                // Security skeleton
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                      <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gradient-to-r from-zinc-800/20 via-zinc-700/40 to-zinc-800/20 rounded animate-pulse" />
                      <div className="h-12 w-full bg-gradient-to-r from-zinc-800/40 via-zinc-700/60 to-zinc-800/40 rounded-xl animate-pulse" />
                    </div>
                  </div>
                  <div className="h-12 w-full bg-gradient-to-r from-red-800/40 via-red-700/60 to-red-800/40 rounded-xl animate-pulse" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-full animate-fade-in-scale">
              {selected === "main" && <EditProfileMain />}
              {selected === "avatar" && <EditProfileAvatar />}
              {selected === "socials" && <EditProfileSocials />}
              {selected === "security" && <EditProfileSecurity />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
